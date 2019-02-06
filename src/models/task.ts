export interface Task {
  id: string,
  name: string,
  description: string,
  taskNo: number,
  descriptionComplete: boolean,
  videoComplete: boolean,
  taskComplete: boolean,
  video?: string,
  questions?: [{
    questionText: string,
    questionComplete: boolean,
    answers: [{
      studentAnswer?: boolean,
      answerText:string,
      correct: string
    }]
  }],
  updatedAt?: number
}
