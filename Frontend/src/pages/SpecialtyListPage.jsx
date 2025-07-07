import React, { useEffect, useState } from 'react'

import AddIcon from '@mui/icons-material/Add';
import { Divider } from '@mui/material';

import SpecialtiesCard  from '../components/SpecialtyCard';

import { getAllSpecialties } from '../services/specialtyService';

function SpecialtiesPage() {

  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const specialties = await getAllSpecialties();
      setSpecialties(specialties);
    };
    fetchData();
  }, []);

  return (
    <div>
      <div>
        <h1 className="text-3xl text-custom-blue font-bold mb-4">DANH SÁCH CHUYÊN KHOA</h1>
      </div>
      <Divider className="!mb-6 " />

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

      <button className="fixed bottom-4 right-4 bg-custom-blue text-white px-4 py-2 rounded-xl hover:bg-custom-bluehover2 transition"
        onClick={() => window.location.href = '/admin/specialties/add'}
      >
        <AddIcon className="mr-2" />
        Thêm chuyên khoa
      </button>
    </div>
  )
}

export default SpecialtiesPage
