import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Button, Space, Divider, Select, Input, Modal } from 'antd';
import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    StrikethroughOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    AlignLeftOutlined,
    AlignCenterOutlined,
    AlignRightOutlined,
    LinkOutlined,
    PictureOutlined,
    UndoOutlined,
    RedoOutlined,
} from '@ant-design/icons';

export function RichTextEditor({ value, onChange, placeholder = "Nhập nội dung..." }) {
    const [linkModalVisible, setLinkModalVisible] = React.useState(false);
    const [linkUrl, setLinkUrl] = React.useState('');
    const [imageModalVisible, setImageModalVisible] = React.useState(false);
    const [imageUrl, setImageUrl] = React.useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Link.configure({
                openOnClick: false,
            }),
            Image,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    React.useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '');
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const addLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setLinkModalVisible(false);
        }
    };

    const addImage = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl('');
            setImageModalVisible(false);
        }
    };

    return (
        <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            {/* Toolbar */}
            <div style={{
                padding: '12px',
                borderBottom: '1px solid #d9d9d9',
                background: '#fafafa',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                alignItems: 'center'
            }}>
                {/* Heading */}
                <Select
                    size="small"
                    style={{ width: 120 }}
                    value={
                        editor.isActive('heading', { level: 1 }) ? 'h1' :
                            editor.isActive('heading', { level: 2 }) ? 'h2' :
                                editor.isActive('heading', { level: 3 }) ? 'h3' :
                                    'paragraph'
                    }
                    onChange={(value) => {
                        if (value === 'paragraph') {
                            editor.chain().focus().setParagraph().run();
                        } else {
                            const level = parseInt(value.replace('h', ''));
                            editor.chain().focus().toggleHeading({ level }).run();
                        }
                    }}
                    options={[
                        { label: 'Đoạn văn', value: 'paragraph' },
                        { label: 'Tiêu đề 1', value: 'h1' },
                        { label: 'Tiêu đề 2', value: 'h2' },
                        { label: 'Tiêu đề 3', value: 'h3' },
                    ]}
                />

                <Divider type="vertical" />

                {/* Text formatting */}
                <Space size="small">
                    <Button
                        size="small"
                        icon={<BoldOutlined />}
                        type={editor.isActive('bold') ? 'primary' : 'default'}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    />
                    <Button
                        size="small"
                        icon={<ItalicOutlined />}
                        type={editor.isActive('italic') ? 'primary' : 'default'}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    />
                    <Button
                        size="small"
                        icon={<UnderlineOutlined />}
                        type={editor.isActive('underline') ? 'primary' : 'default'}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    />
                    <Button
                        size="small"
                        icon={<StrikethroughOutlined />}
                        type={editor.isActive('strike') ? 'primary' : 'default'}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    />
                </Space>

                <Divider type="vertical" />

                {/* Lists */}
                <Space size="small">
                    <Button
                        size="small"
                        icon={<OrderedListOutlined />}
                        type={editor.isActive('orderedList') ? 'primary' : 'default'}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    />
                    <Button
                        size="small"
                        icon={<UnorderedListOutlined />}
                        type={editor.isActive('bulletList') ? 'primary' : 'default'}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    />
                </Space>

                <Divider type="vertical" />

                {/* Alignment */}
                <Space size="small">
                    <Button
                        size="small"
                        icon={<AlignLeftOutlined />}
                        type={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    />
                    <Button
                        size="small"
                        icon={<AlignCenterOutlined />}
                        type={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    />
                    <Button
                        size="small"
                        icon={<AlignRightOutlined />}
                        type={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    />
                </Space>

                <Divider type="vertical" />

                {/* Links & Images */}
                <Space size="small">
                    <Button
                        size="small"
                        icon={<LinkOutlined />}
                        onClick={() => setLinkModalVisible(true)}
                    />
                    <Button
                        size="small"
                        icon={<PictureOutlined />}
                        onClick={() => setImageModalVisible(true)}
                    />
                </Space>

                <Divider type="vertical" />

                {/* Undo/Redo */}
                <Space size="small">
                    <Button
                        size="small"
                        icon={<UndoOutlined />}
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    />
                    <Button
                        size="small"
                        icon={<RedoOutlined />}
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    />
                </Space>
            </div>

            {/* Editor Content */}
            <div style={{ minHeight: '400px', padding: '16px' }}>
                <EditorContent editor={editor} />
            </div>

            {/* Link Modal */}
            <Modal
                title="Chèn liên kết"
                open={linkModalVisible}
                onOk={addLink}
                onCancel={() => setLinkModalVisible(false)}
            >
                <Input
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onPressEnter={addLink}
                />
            </Modal>

            {/* Image Modal */}
            <Modal
                title="Chèn hình ảnh"
                open={imageModalVisible}
                onOk={addImage}
                onCancel={() => setImageModalVisible(false)}
            >
                <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onPressEnter={addImage}
                />
            </Modal>

            <style>{`
                .ProseMirror {
                    outline: none;
                    min-height: 400px;
                }
                .ProseMirror p {
                    margin: 0 0 1em 0;
                }
                .ProseMirror h1 {
                    font-size: 2em;
                    font-weight: bold;
                    margin: 0.5em 0;
                }
                .ProseMirror h2 {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin: 0.5em 0;
                }
                .ProseMirror h3 {
                    font-size: 1.17em;
                    font-weight: bold;
                    margin: 0.5em 0;
                }
                .ProseMirror ul, .ProseMirror ol {
                    padding-left: 2em;
                    margin: 1em 0;
                }
                .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                }
                .ProseMirror a {
                    color: #1890ff;
                    text-decoration: underline;
                }
                .ProseMirror blockquote {
                    border-left: 3px solid #d9d9d9;
                    padding-left: 1em;
                    margin-left: 0;
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}