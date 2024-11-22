"use client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FormEvent, useState } from "react";

interface Component {
  name: string;
  description: string;
  props?: string[];
  features?: string[];
  dependencies?: string[];
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const promptText = `As an experienced frontend developer, analyze the following project and provide a list of features.  You must respond with a valid JSON array using this exact structure:

  [
    {
      "name": "FeatureName",
      "description": "Brief description of the feature's purpose",
      "userStories": ["User story 1", "User story 2"],
      "technicalDetails": ["Technical detail 1", "Technical detail 2"],
      "priority": "high" // or "medium", "low"
    }
  ]

  Project requirements:
  ${prompt || "Please provide your specific project requirements"}

  Remember: The response must be a valid JSON array that can be parsed with JSON.parse().`;

    try {
      const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GEMINI_API_KEY!
      );
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(promptText);
      const response = await result.response;
      let text = response.text();

      // Get only the content between ```json and ```
      text = text.match(/```json\s*([\s\S]*?)\s*```/)?.[1]?.trim() || text;

      console.log("Cleaned text:", text); // For debugging

      // Parse the JSON response
      const parsedComponents = JSON.parse(text);
      setComponents(parsedComponents);
    } catch (error) {
      console.error("Error generating content:", error);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const ComponentCard = ({ component }: { component: Component }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-3">
        {" "}
        {/* Container for checkbox and title */}
        <input type="checkbox" className="mr-2" /> {/* Checkbox */}
        <h3 className="text-xl font-bold text-blue-600">{component.name}</h3>
      </div>
      <p className="text-gray-600 mb-4">{component.description}</p>

      {component.props && component.props.length > 0 && (
        <div className="mb-3">
          <h4 className="font-semibold text-gray-700 mb-2">Props:</h4>
          <ul className="list-disc list-inside text-gray-600">
            {component.props.map((prop, index) => (
              <li key={index}>{prop}</li>
            ))}
          </ul>
        </div>
      )}

      {component.features && component.features.length > 0 && (
        <div className="mb-3">
          <h4 className="font-semibold text-gray-700 mb-2">Features:</h4>
          <ul className="list-disc list-inside text-gray-600">
            {component.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {component.dependencies && component.dependencies.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Dependencies:</h4>
          <div className="flex flex-wrap gap-2">
            {component.dependencies.map((dep, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Project Feature Generator
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your project requirements here..."
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-300 min-h-[100px]"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition-colors"
              disabled={loading}
            >
              {loading ? "Generating Components..." : "Generate Components"}
            </button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating components...</p>
          </div>
        ) : components.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component, index) => (
              <ComponentCard key={index} component={component} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Enter your project requirements to generate components
          </p>
        )}
      </div>
    </main>
  );
}
