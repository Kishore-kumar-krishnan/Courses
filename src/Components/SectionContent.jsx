import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    VideoCameraIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const SectionContent = ({ section, user }) => {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showVideoForm, setShowVideoForm] = useState(false);
    const [showPdfForm, setShowPdfForm] = useState(false);
    const [currentSectionId, setCurrentSectionId] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoTitle, setVideoTitle] = useState('');
    const [pdfUrl, setPdfUrl] = useState(''); // Assuming you'll have a URL for PDF as well if not a file upload
    const [pdfTitle, setPdfTitle] = useState('');

    // Fetch content when section changes
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/course/section/content/details?id=${section.section_id}`
                );
                setContents(response.data);
            } catch (error) {
                console.error("Error fetching content:", error);
            } finally {
                setLoading(false);
            }
        };

        if (section.section_id) {
            fetchContent();
        }
    }, [contents]);

    // Handle opening video form
    const handleAddVideo = (sectionId) => {
        setCurrentSectionId(sectionId);
        setShowVideoForm(true);
    };

    // Handle opening PDF form
    const handleAddPdf = (sectionId) => {
        setCurrentSectionId(sectionId);
        setShowPdfForm(true);
    };

    // Unified content submission handler
    const handleSubmitContent = async (contentType, contentUrl, contentTitle) => {
        if (!window.confirm(`Are you sure you want to Add this ${contentType}?`)) return;
        try {
            // Prepare request body matching your API spec
            const requestBody = {
                contentType: contentType.toUpperCase(),
                content: contentUrl,
                section: { section_id: currentSectionId }
            };

            // Make API call
            await axios.post(
                'http://localhost:8080/api/course/section/content/add',
                requestBody
            );

            // Refetch content to update UI
            const contentResponse = await axios.get(
                `http://localhost:8080/api/course/section/content/details?id=${currentSectionId}`
            );
            setContents(contentResponse.data);

            // Close form and reset
            setShowVideoForm(false);
            setShowPdfForm(false);

            // Show success message

        } catch (error) {
            console.error(`Error adding ${contentType}:`, error);
        }
    };

    // Remove Content Handler
    const handleRemoveContent = async (contentId, contentType) => {
        if (!window.confirm(`Are you sure you want to delete this ${contentType} ? `)) return;

        try {
            await axios.delete(`http://localhost:8080/api/course/section/content/delete`,{
                data: contentId
            } 
            );

            // Update local state by filtering out the deleted content
            setContents(prev => prev.filter(c => c.id !== contentId));
        } catch (error) {
            console.error(`Error deleting ${contentType}:`, error);
            alert(error.response?.data?.message || `Failed to delete ${contentType}`);
        }
    };

    const videos = contents.filter(c => c.contentType === "VIDEO");
    const pdfs = contents.filter(c => c.contentType === "PDF");
   
    if (loading) return <div>Loading content...</div>;

    // Filter contents by type

    return (
        <div className="space-y-8">
            {/* Video Lectures Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                        <VideoCameraIcon className="w-5 h-5 text-gray-800" />
                        Video Lectures
                    </h4>
                    {(user.role === "teacher" || user.role === "admin") && (
                        <button
                            onClick={() => handleAddVideo(section.section_id)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 font-semibold"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add Video
                        </button>
                    )}
                </div>

                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map((video, index) => (
                            <div key={index} className="bg-gray-100 p-4 rounded-lg relative shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-medium text-gray-800">
                                        {`${video.contentType} ${index+1}` || 'Untitled Video'}
                                    </h5>
                                    {(user.role === "teacher" || user.role === "admin") && (
                                        <button
                                            onClick={() => handleRemoveContent(video.content_id, "VIDEO")}
                                            className="text-gray-500 hover:text-gray-800"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="aspect-w-16 aspect-h-9">
                                    <iframe
                                        src={video.content}
                                        className="w-full h-48 rounded-lg border border-gray-200"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No videos added yet</p>
                )}
            </div>

            {/* PDF Materials Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold flex items-center gap-2 text-gray-900">
                        <DocumentTextIcon className="w-5 h-5 text-gray-800" />
                        PDF Materials
                    </h4>
                    {(user.role === "teacher" || user.role === "admin") && (
                        <button
                            onClick={() => handleAddPdf(section.section_id)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 font-semibold"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add PDF
                        </button>
                    )}
                </div>

                {pdfs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pdfs.map((pdf, index) => (
                            <div key={index} className="bg-gray-100 p-4 rounded-lg relative shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-medium text-gray-800">
                                        {`${pdf.contentType} ${index+1}` || 'Untitled PDF'}
                                    </h5>
                                    {(user.role === "teacher" || user.role === "admin") && (
                                        <button
                                            onClick={() => handleRemoveContent(pdf.content_id, "PDF")}
                                            className="text-gray-500 hover:text-gray-800"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-white rounded border border-gray-200">
                                    <DocumentTextIcon className="w-8 h-8 text-red-500" />
                                    <a
                                        href={pdf.content}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline truncate"
                                    >
                                        {pdf.content.split('/').pop() || 'PDF Document'}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No PDFs added yet</p>
                )}
            </div>
            {/* Video Form */}
            {showVideoForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Add New Video</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Video URL</label>
                                <input
                                    type="text"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    className="mt-1 h-10 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title (Optional)</label>
                                <input
                                    type="text"
                                    value={videoTitle}
                                    onChange={(e) => setVideoTitle(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Introduction Video"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowVideoForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSubmitContent('VIDEO', videoUrl, videoTitle)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer"
                                >
                                    Add Video
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Pdf Form */}
            {showPdfForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Add New PDF</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">PDF URL</label>
                                <input
                                    type="url"
                                    value={pdfUrl}
                                    onChange={(e) => setPdfUrl(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="https://example.com/document.pdf"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title (Optional)</label>
                                <input
                                    type="text"
                                    value={pdfTitle}
                                    onChange={(e) => setPdfTitle(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    placeholder="Lecture Notes"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPdfForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSubmitContent('PDF', pdfUrl, pdfTitle)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer"
                                >
                                    Add PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionContent;