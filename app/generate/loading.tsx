import LoadingSharedCard from "@/components/loading";

export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(13, 17, 23, 0.9)",
        zIndex: 9999,
        backdropFilter: "blur(5px)",
      }}
    >
      <LoadingSharedCard />
    </div>
  );
}
