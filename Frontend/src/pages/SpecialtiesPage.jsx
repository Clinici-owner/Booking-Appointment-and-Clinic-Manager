import React, { useEffect, useState } from "react";

import SpecialtiesCard from "../components/SpecialtyCard";
import BannerName from "../components/BannerName";

import { getOpenSpecialties } from "../services/specialtyService";
function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const specialties = await getOpenSpecialties();
      setSpecialties(specialties);
    };
    fetchData();
  }, []);

  return (
    <div>
      <BannerName Text="Chuyên khoa" />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {specialties.map((specialty) => (
            <SpecialtiesCard
              key={specialty._id}
              id={specialty._id}
              name={specialty.specialtyName}
              description={specialty.descspecialty}
              logo={specialty.logo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpecialtiesPage;
