export default async function getData(prompt: string): Promise<string|null> {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AQ.Ab8RN6LJkiawRrQfI-43cEJUGCT5amV22TBgOVnCps8T02Z9SA" 
           },
           body: JSON.stringify(
            {
    "contents": [
      {
        "parts": [
          {
            "text": prompt
          }
        ]
      }
    ]
    })
})
const data = await response.json();
if(!response.ok) {
  throw new Error("Some error in fetching API");
}

return data.candidates[0].content.parts[0].text;
};
