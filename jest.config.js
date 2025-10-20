export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  // extensionsToTreatAsEsm: ['.js'], // 👈 esto le dice a Jest que trate tus archivos .js como ESM
};
