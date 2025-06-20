import React from 'react'

import AddIcon from '@mui/icons-material/Add';

function SpecialtiesPage() {
  return (
    <div>
      <div>
        <h1 className="text-3xl text-custom-blue font-bold mb-4">Danh sách chuyên khoa</h1>
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
