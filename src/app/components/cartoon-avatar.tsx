/**
 * 卡通头像 - 扁平风 AI/机器人造型，圆脸 + 大圆眼 + 微笑弧线，适合对话助手
 */
interface CartoonAvatarProps {
  className?: string;
  size?: number;
}

export function CartoonAvatar({ className = "", size = 32 }: CartoonAvatarProps) {
  const strokeWidth = Math.max(1, size / 24);
  const eyeRadius = size * 0.12;
  const eyeY = size * 0.38;
  const eyeOffset = size * 0.2;
  const mouthY = size * 0.62;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-blue-600 shadow-md ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        className="text-white"
      >
        {/* 左眼 */}
        <circle
          cx={size / 2 - eyeOffset}
          cy={eyeY}
          r={eyeRadius}
          fill="currentColor"
        />
        {/* 右眼 */}
        <circle
          cx={size / 2 + eyeOffset}
          cy={eyeY}
          r={eyeRadius}
          fill="currentColor"
        />
        {/* 微笑弧线 */}
        <path
          d={`M ${size * 0.32} ${mouthY} Q ${size / 2} ${size * 0.72} ${size * 0.68} ${mouthY}`}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
