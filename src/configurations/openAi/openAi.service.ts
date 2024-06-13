import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  constructor(private config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.config.get('OPENAI_API_KEY'),
    });
  }
  openai: OpenAI;
  async analyseWithOpenAi(
    context: string,
    question: string,
    previousQuestions: string[],
  ) {
    const chatCompletion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a chat bot to answer based on the context of data extracted from a pdf',
        },
        {
          role: 'system',
          content: `You will be given the question and the context extracted with a pdf extraction library`,
        },
        {
          role: 'system',
          content: `You will be given the array questions asked by the user previously.so that the answers have to be in a way that you remember the older questions and it's answers.`,
        },
        {
          role: 'system',
          content: `Context of the pdf is ${context}`,
        },
        {
          role: 'system',
          content: `Question by the user is ${question}`,
        },
        {
          role: 'system',
          content: `array of previous questions is ${previousQuestions}`,
        },
        // {
        //   role: 'user',
        //   content:`Question is ${question}`
      ],
      model: 'gpt-3.5-turbo',
    });
    const answer = chatCompletion.choices[0].message.content;
    return answer;
  }
}
