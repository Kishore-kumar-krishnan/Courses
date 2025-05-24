export const allCourses = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Course ${i + 1}`,
  category: ["Math", "Science", "Programming", "Art"][i % 4],
  description: `This is a short description for Course ${i + 1}.`,
  longDescription: `This is a detailed description for Course ${
    i + 1
  } covering all key aspects.`,
  image: `https://source.unsplash.com/400x250/?course,${
    ["math", "science", "programming", "art"][i % 4]
  },${i + 1}`,
  author: `Author ${(i % 5) + 1}`,
  createdAt: new Date(Date.now() - i * 86400000).toLocaleDateString(),
  sections: [
    {
      title: "Section 1",
      content: "Detailed content for section 1...",
      duration: "2 hours",
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
      title: "Section 2",
      content: "Detailed content for section 2...",
      duration: "3 hours",
      assignments: [],
    },
  ],
  syllabusPdf: "/sample-syllabus.pdf", // Path to your PDF file
}));
