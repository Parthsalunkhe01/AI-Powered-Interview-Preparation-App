import React from "react";

const DeleteAlertContent = ({ content, onDelete }) => {
  return (
    <div className="p-5">
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-800">Delete Alert</h2>

      {/* Divider line */}
      <hr className="my-3 border-gray-200" />

      {/* Alert message */}
      <p className="text-[14px] text-gray-700">{content}</p>

      {/* Button section */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="px-6 py-2 rounded-full text-white font-medium 
                     bg-gradient-to-r from-[#FF9324] to-[#e99a4b] 
                     hover:from-[#e68a1f] hover:to-[#d97a2c] 
                     shadow-md hover:shadow-lg transition-all duration-300"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteAlertContent;
