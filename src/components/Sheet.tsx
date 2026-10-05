"use client";

/** 모바일: 하단 바텀시트 / 데스크톱: 오른쪽 사이드 패널 */
export default function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <aside
      aria-label={title}
      className="absolute inset-x-0 bottom-0 z-[1000] flex max-h-[62dvh] flex-col rounded-t-3xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.18)] md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[400px] md:rounded-none md:rounded-l-3xl"
    >
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-300 md:hidden" />
      <div className="flex items-center justify-between px-5 pb-1 pt-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600"
        >
          ✕
        </button>
      </div>
      <div className="overflow-y-auto px-5 pb-6">{children}</div>
    </aside>
  );
}
