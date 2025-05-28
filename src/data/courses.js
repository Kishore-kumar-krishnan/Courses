export const allCourses = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Course ${i + 1}`,
  category: ["Math", "Science", "Programming", "Art"][i % 4],
  description: `This is a short description for Course ${i + 1}.`,
  longDescription: `This is a detailed description for Course ${i + 1} covering all key aspects.`,
  image: [
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=500&auto=format&fit=crop", // Programming
    "https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=500&auto=format&fit=crop", // Math
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop", // Science
    "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=500&auto=format&fit=crop"  // Art
  ][i % 4],
  author: `Author ${(i % 5) + 1}`,
  createdAt: new Date(Date.now() - i * 86400000).toLocaleDateString(),
  updatedAt: new Date(Date.now() - i * 86400000).toLocaleDateString(),
  duration: "2 hours",
  credit: "",
  isActive: "true",
  sections: [
    {
      id: 1,
      title: "Section 1",
      content: "Detailed content for section 1...",
      videos: [],
      pdfs: [],
      assignments: [
        {
          id: 1,
          title: "Assignment 1",
          description: "Complete the exercises",
          dueDate: "2023-12-15",
          submitted: false,
        },
      ],
    },
    {
      id: 2,
      title: "Section 2",
      content: "Detailed content for section 2...",
      videos: [],
      pdfs: [],
      assignments: [],
    },
  ],
}));