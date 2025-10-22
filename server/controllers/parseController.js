import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const parseTask = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text)
            return res.status(400).json({ error: 'Missing text input' });

        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Extract task name, date, and time from user input.'},
                { role: 'user', content: text }
            ],
        });

        const parsed = response.choices[0].message.content;
        res.json({ parsed });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to parse input' });
    }
}