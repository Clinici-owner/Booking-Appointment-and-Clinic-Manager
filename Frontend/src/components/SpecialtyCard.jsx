import React from "react";

function SpecialtiesCard({id, name, description, logo }) {
  const cleanedDescription = description.replace('Giới thiệu chung', '');

  return (
    <div className="max-w-xs w-full h-74 border border-gray-300 rounded-2xl p-6 text-center font-inter shadow-sm bg-white hover:shadow-lg transition duration-300 hover:bg-custom-bluehover">
      <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-[#9B7E3F] flex items-center justify-center">
        <img
          alt="Detailed illustration of a human heart anatomical icon in white on brown circular background"
          className="w-10 h-10  rounded-full object-cover"
          src={logo}
        />
      </div>
      <h2 className="text-lg font-semibold text-custom-blue mb-2">KHOA {name}</h2>
      <p
        className="text-slate-600 text-base text-sm leading-relaxed mb-3 px-2 font-inter  overflow-hidden text-ellipsis line-clamp-3"
        dangerouslySetInnerHTML={{ __html: cleanedDescription }}
      ></p>
      <p className="text-custom-blue font-semibold text-base cursor-pointer hover:underline transition">
        <a href={`/admin/specialties/${id}`}>Xem chi tiết</a>
      </p>
    </div>
  );
}

export default SpecialtiesCard;
