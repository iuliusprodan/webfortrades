import { isUkMobileCandidate } from "./uk_mobile.js";

let failed = 0;
function check(input: string, expected: boolean, label: string): void {
  const got = isUkMobileCandidate(input);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}: ${label} -> ${got} (expected ${expected}) [${JSON.stringify(input)}]`);
}

check("07913 163118", true, "UK mobile local 07");
check("+447913163118", true, "UK mobile +44");
check("447913163118", true, "UK mobile 44 no plus");
check("0161 333 4444", false, "UK landline 01");
check("020 7946 0000", false, "UK landline 02");
check("0800 123 4567", false, "UK non-geo 0800");
check("+1 212 555 1234", false, "international US +1");
check("not-a-number", false, "garbage input");
check("+44 (0)7913-163.118", false, "malformed: +44 with leading 0 after code");

if (failed > 0) {
  console.error(`\nuk_mobile: ${failed} failure(s)`);
  process.exit(1);
}
console.log("\nuk_mobile: all cases passed");
