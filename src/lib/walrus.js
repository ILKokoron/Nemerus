const PUBLISHER = 'https://publisher.walrus-testnet.walrus.space'
const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space'

export async function uploadToWalrus(data) {
  const json = JSON.stringify(data)
  const blob = new Blob([json], { type: 'application/json' })

  const res = await fetch(`${PUBLISHER}/v1/blobs?epochs=5`, {
    method: 'PUT',
    body: blob,
  })

  if (!res.ok) throw new Error(`Walrus upload failed: ${res.status}`)

  const result = await res.json()

  const blobId =
    result.newlyCreated?.blobObject?.blobId ||
    result.alreadyCertified?.blobId

  if (!blobId) throw new Error('No blob ID returned')
  return blobId
}

export async function fetchFromWalrus(blobId) {
  const res = await fetch(`${AGGREGATOR}/v1/blobs/${blobId}`)
  if (!res.ok) throw new Error(`Walrus fetch failed: ${res.status}`)
  return await res.json()
}
