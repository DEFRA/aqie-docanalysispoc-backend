import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      include: [],
      exclude: [...configDefaults.exclude, 'coverage', 'src/**']
    }
    // setupFiles: ['.vite/setup-files.js']
  }
})

// import { defineConfig, configDefaults } from 'vitest/config'

// export default defineConfig({
//   test: {
//     globals: true,
//     environment: 'node',
//     clearMocks: true,
//     // Removed coverage block
//     exclude: [...configDefaults.exclude, 'coverage']
//   }
// })
