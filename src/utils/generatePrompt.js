// src/utils/generatePrompt.js

export default function generatePrompt(audience) {
  const baseInstruction = `
    Create a LinkedIn post, detailing a contrived business lesson, to accompany this photo. 
    
    Your post should be at least 1,000 characters long. You should break up long chunks of text onto new lines, to make it easily readable and LinkedIn-esque.
    
    End with a question or call to action to encourage engagement.`;

  const audienceNote = audience?.trim()
    ? ` Make sure the message resonates with people in ${audience}.`
    : "";

  return `${baseInstruction}${audienceNote}`;
}
