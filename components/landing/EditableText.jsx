"use client";

export default function EditableText({ path, multiline = false, tag: Tag = "span", children, ...props }) {
  if (!path) return <Tag {...props}>{children}</Tag>;
  return (
    <Tag data-edit={path} data-edit-multiline={multiline ? "true" : undefined} {...props}>
      {children}
    </Tag>
  );
}
