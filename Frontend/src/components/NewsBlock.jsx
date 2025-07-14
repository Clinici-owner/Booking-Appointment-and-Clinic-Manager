import React from "react";

function NewsContentBlock({ block, isPreview = false }) {
  if (!block || !block.type || !block.content) return null;

  switch (block.type) {
    case "text":
      return (
        <p
          className={
            isPreview
              ? "text-sm text-gray-800 line-clamp-2 mt-2"
              : "text-base text-gray-900 leading-relaxed my-4"
          }
        >
          {isPreview
            ? block.content.slice(0, 100) + (block.content.length > 100 ? "..." : "")
            : block.content}
        </p>
      );

    case "image":
      return isPreview ? null : (
        <img
          src={block.content}
          alt="Hình ảnh bài viết"
          className="w-full rounded-md shadow-sm my-4"
        />
      );

    case "quote":
      return (
        <blockquote
          className={
            isPreview
              ? "italic text-gray-600 text-sm"
              : "border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4"
          }
        >
          {block.content}
        </blockquote>
      );

    case "video":
      return isPreview ? null : (
        <div className="my-4">
          <iframe
            src={block.content}
            title="Video nội dung"
            frameBorder="0"
            allowFullScreen
            className="w-full aspect-video rounded-md"
          />
        </div>
      );

    default:
      return null;
  }
}

export default NewsContentBlock;
