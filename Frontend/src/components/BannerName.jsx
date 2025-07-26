import React from "react";

import BannerNameImg from "../assets/images/bannerName.png";

function BannerName({Text}) {
  return (
    <div className="p-0 m-0 relative">
  <img
    src={BannerNameImg}
    alt="Phòng khám Phúc Hưng logo with red and blue colors and medical cross"
    className="w-full h-auto object-cover rounded-xl"
  />
  <div className="absolute inset-0 flex items-center justify-center text-custom-blue text-[36px] font-bold ">
    {Text}
  </div>
</div>

  );
}

export default BannerName;
