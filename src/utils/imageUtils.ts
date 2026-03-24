import { CELL_EXPORT_WIDTH, CELL_EXPORT_HEIGHT } from './constants'

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Falha ao ler a imagem'))
    }
    reader.onerror = () => reject(new Error('Falha ao ler a imagem'))
    reader.readAsDataURL(file)
  })

export const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Falha ao carregar a imagem'))
    image.src = src
  })

export const normalizeImage = async (file: File): Promise<string> => {
  const sourceUrl = await fileToDataUrl(file)
  const image = await loadImage(sourceUrl)
  const canvas = document.createElement('canvas')
  canvas.width = CELL_EXPORT_WIDTH
  canvas.height = CELL_EXPORT_HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas indisponível')

  const scale = Math.max(canvas.width / image.width, canvas.height / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const offsetX = (canvas.width - drawWidth) / 2
  const offsetY = (canvas.height - drawHeight) / 2

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
  return canvas.toDataURL('image/jpeg', 0.9)
}
