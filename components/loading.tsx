import "./loading.css";

export default function LoadingSharedCard() {
  return (
    <div className="loading-container">
      <svg
        className="svg-loader"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="loader-path"
          d="M10,50 C10,30 30,10 50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 Z"
        />
        <path
          className="loader-path"
          d="M20,50 C20,35 35,20 50,20 C65,20 80,35 80,50 C80,65 65,80 50,80 C35,80 20,65 20,50 Z"
        />
        <path
          className="loader-path"
          d="M30,50 C30,40 40,30 50,30 C60,30 70,40 70,50 C70,60 60,70 50,70 C40,70 30,60 30,50 Z"
        />
        <path
          className="loader-path"
          d="M40,50 C40,45 45,40 50,40 C55,40 60,45 60,50 C60,55 55,60 50,60 C45,60 40,55 40,50 Z"
        />
      </svg>
    </div>
  );
}
