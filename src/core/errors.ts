interface IAppErrors {
  [key: string]: {
    [key: string]: string
  }
}

export const errors: IAppErrors = {
  message: {
    23502: 'Select chat to send message'
  }
}
