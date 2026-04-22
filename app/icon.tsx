import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 64,
  height: 64
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent"
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#eaf6ff",
            borderRadius: 14,
            border: "1px solid rgba(148, 163, 184, 0.2)",
            boxShadow: "0 10px 24px rgba(37, 99, 235, 0.12)"
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="9" stroke="#243042" strokeWidth="1.9" />
            <path
              d="m15.35 8.65-3.56 1.17a1.1 1.1 0 0 0-.69.69l-1.17 3.56a.38.38 0 0 0 .48.48l3.56-1.17a1.1 1.1 0 0 0 .69-.69l1.17-3.56a.38.38 0 0 0-.48-.48Z"
              fill="#243042"
            />
            <circle cx="12" cy="12" r="1.15" fill="#243042" />
          </svg>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
