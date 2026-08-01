/**
 * Brand wordmark. Set in Space Grotesk to stand apart from Orbitron headings
 * and DM Sans body copy.
 *
 * The logo is the wordmark itself: the dot on the "i" of "iptv" is replaced by a
 * play triangle (a dotless "ı" U+0131 plus a positioned CSS triangle). The icon
 * form of the same idea lives in public/favicon.svg. Sizes use em units so the
 * play-dot scales with whatever font-size the wordmark is rendered at.
 */
export function Wordmark({
  className = "",
  tldClassName = "text-[#E0345F]",
  showTld = true,
  playColor = "#E0345F",
}: {
  className?: string;
  tldClassName?: string;
  showTld?: boolean;
  playColor?: string;
}) {
  return (
    <span className={`font-wordmark font-bold tracking-[-0.035em] ${className}`}>
      goedkope
      <span className="relative inline-block">
        {"ı"}
        <span
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "0.08em",
            width: 0,
            height: 0,
            borderTop: "0.13em solid transparent",
            borderBottom: "0.13em solid transparent",
            borderLeft: `0.2em solid ${playColor}`,
          }}
        />
      </span>
      ptv
      {showTld && <span className={`font-medium ${tldClassName}`}>.com</span>}
    </span>
  );
}
