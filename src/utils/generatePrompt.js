// src/utils/generatePrompt.js

export default function generatePrompt(audience) {
  const baseInstruction = `
    Create a LinkedIn post, detailing a contrived business 
    lesson, to accompany this photo. 
    
    Your post should be at least 1,000 characters long. 

    You should start your post with either:
    - A bold statement to catch people's attention
    - An enticing hook to encourage them to read further
    
    End with a question or call to action to encourage engagement.
  
    Before returning your LinkedIn post, you should check to make 
    sure that there aren't any large blocks of text. Large blocks 
    of text are defined as a paragraph of 200 characters or more, which 
    is not interrupted by a line break. 
    
    Where possible (eg where they aren't a continuous sentence), longer 
    blocks of text should be broken down into individual paragraphs, 
    separated by a blank line (double newline character: \\n\\n).

    You should not, under any circumstances, introduce any line breaks mid-sentence.

    Here is an example of a text block which is too long:

    "We often get so caught up in searching for the *right* locker that we forget to focus on cracking the code. We spend time comparing our locker (or its perceived contents) to others', wondering if we chose the right one, or if the grass is greener on the other side of the storage unit. Sound familiar?"

    And here's how it can be changed to become more readable:

    "We often get so caught up in searching for the *right* locker that we forget to focus on cracking the code.  
    
    We spend time comparing our locker (or its perceived contents) to others', wondering if we chose the right one, or if the grass is greener on the other side of the storage unit. 
    
    Sound familiar?"
  
  `;

  const audienceNote = audience?.trim()
    ? ` Make sure the message resonates with people in ${audience}.`
    : "";

  return `${baseInstruction}${audienceNote}`;
}
