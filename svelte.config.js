const production = !process.env.ROLLUP_WATCH;

module.exports = {
    compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
    }
};
