import video from "../../assets/drag-drop.mp4";

const VideoApp = () => {
  return (
    <div className="hidden lg:block w-full max-w-[480px] min-[1550px]:max-w-[720px] mb-10 transition-all duration-500 ml-auto mr-auto max-[1800px]:mr-8">
      <video
        style={{ opacity: 0.5, borderRadius: "12px" }}
        className="w-full h-auto shadow-inner"
        controls={false}
        loop
        autoPlay
        muted
        playsInline
      >
        <source src={video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default VideoApp;
