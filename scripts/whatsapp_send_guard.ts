import {
  sendWhatsAppMessage,
  sendWhatsAppVideo,
  type WhatsAppVideoOptions,
} from "./whatsapp_gateway.js";
import {
  assertOutreachPayloadValid,
  sleepMs,
  WHATSAPP_INTER_MESSAGE_DELAY_MS,
} from "./outreach_message_format.js";

export interface PitchSendCounts {
  textSentCount: number;
  videoSentCount: number;
  videoSendAttempts: number;
}

/**
 * Per-run guard so pitch text and video each deliver at most once per pitch run.
 */
export class PitchSendGuard {
  private textMessagesSent = 0;
  private videoDone = false;

  readonly counts: PitchSendCounts = {
    textSentCount: 0,
    videoSentCount: 0,
    videoSendAttempts: 0,
  };

  reset(): void {
    this.textMessagesSent = 0;
    this.videoDone = false;
    this.counts.textSentCount = 0;
    this.counts.videoSentCount = 0;
    this.counts.videoSendAttempts = 0;
  }

  async sendTextOnce(phone: string, text: string, touch?: number): Promise<boolean> {
    if (this.textMessagesSent >= 2) {
      console.log("Text send: duplicate prevented (max 2 text messages per pitch run)");
      return false;
    }

    console.log(`Text send: started (${this.textMessagesSent + 1}/2)`);
    await sendWhatsAppMessage(phone, text, touch);
    this.textMessagesSent++;
    this.counts.textSentCount = this.textMessagesSent;
    console.log("Text send: success");
    return true;
  }

  /**
   * Canonical two-message pitch: site text, pause, optional video intro text, pause, video attachment.
   * Fails if messages combine site and video URLs.
   */
  async sendPitchSequence(
    phone: string,
    messages: string[],
    options: {
      touch?: number;
      videoPath?: string;
      siteUrl?: string;
      videoUrl?: string;
      /** Fixed ms or supplier (batch mode uses random 3-6s). */
      interMessageDelayMs?: number | (() => number);
    } = {}
  ): Promise<void> {
    if (messages.length === 0) {
      throw new Error("Pitch sequence requires at least one message.");
    }

    assertOutreachPayloadValid({
      messages,
      siteUrl: options.siteUrl,
      videoUrl: options.videoUrl,
      videoAttachment: Boolean(options.videoPath),
    });

    const pause = (): number =>
      typeof options.interMessageDelayMs === "function"
        ? options.interMessageDelayMs()
        : (options.interMessageDelayMs ?? WHATSAPP_INTER_MESSAGE_DELAY_MS);

    await this.sendTextOnce(phone, messages[0]!, options.touch);

    if (messages.length > 1) {
      await sleepMs(pause());
      await this.sendTextOnce(phone, messages[1]!, options.touch);
    }

    if (options.videoPath) {
      await sleepMs(pause());
      await this.sendVideoOnce(phone, options.videoPath, {});
    }
  }

  async sendVideoOnce(
    phone: string,
    videoPath: string,
    options: WhatsAppVideoOptions & { maxAttempts?: number } = {}
  ): Promise<boolean> {
    if (this.videoDone) {
      console.log("Video send: duplicate prevented");
      return false;
    }

    if (options.caption?.trim()) {
      throw new Error(
        "Video captions must not contain pitch copy. Send the video intro as a separate text message."
      );
    }

    const maxAttempts = Math.min(Math.max(options.maxAttempts ?? 2, 1), 2);
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (this.videoDone) {
        console.log("Video send: duplicate prevented");
        return false;
      }

      this.counts.videoSendAttempts = attempt;
      console.log(`Video send: started (attempt ${attempt}/${maxAttempts})`);

      try {
        await sendWhatsAppVideo(phone, videoPath, options);
        this.videoDone = true;
        this.counts.videoSentCount = 1;
        console.log("Video send: success");
        console.log(`Video send attempts: ${attempt}`);
        return true;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxAttempts) {
          console.log(`Video send: retry scheduled (${lastError.message})`);
          continue;
        }
      }
    }

    if (lastError) throw lastError;
    return false;
  }
}
