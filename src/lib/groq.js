export async function summarizeProject(input, apiKey) {
  if (!apiKey) throw new Error('No Groq API key')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: 'You are writing research notes for a crypto-native airdrop farmer and Web3 builder with 6 years in the space. He tracks projects to farm airdrops, contribute to testnets, and find early alpha. He does not care about price speculation or vague narratives — he wants to know: is there an airdrop likely, what exact on-chain actions matter, what is the project actually doing under the hood, and is it worth his time. Write 2-3 sentences max. Be blunt, specific, tactical. Skip hype. If airdrop probability is low, say so. Mention wallet activity, testnet, points system, or token launch if relevant.',
        },
        {
          role: 'user',
          content: `Summarize this project for my research tracker: ${input}`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Groq error: ${res.status}`)
  }

  const data = await res.json()
  return data.choices[0].message.content.trim()
}
