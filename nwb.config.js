module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'IIIFViewer',
      externals: {
        react: 'React'
      }
    }
  }
}
