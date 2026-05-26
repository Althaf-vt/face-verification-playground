/**
 * SECURITY: This application is NOT enterprise biometric security.
 * Suitable mainly for MVP/prototype testing of face-api.js capabilities.
 * Should NOT be used for banking-grade KYC. False positives are possible.
 * Manual review remains essential for any matrimony onboarding decision.
 */

export default function SecurityBanner() {
  return (
    <div className="bg-amber-500/5 border-b border-amber-500/20">
      <p className="max-w-7xl mx-auto px-4 sm:px-6 py-2 text-[11px] sm:text-xs text-amber-200/70 text-center">
        QA testing only — not banking-grade KYC. Heuristic liveness & matching may produce false
        positives/negatives. Always escalate edge cases to manual review.
      </p>
    </div>
  );
}
