const path = require('path');
const fs = require('fs-extra');
const runBuildLambda = require('../../../test/lib/run-build-lambda');

const FOUR_MINUTES = 240000;

beforeAll(() => {
  process.env.VERCEL_ANALYTICS_ID = 'test';
});

it(
  'Should build Gatsby without any configuration',
  async () => {
    const { workPath } = await runBuildLambda(
      path.join(__dirname, 'build-fixtures/01-gatsby-default')
    );

    const contents = await fs.readdir(workPath);

    expect(contents.some(name => name === 'gatsby-config.js')).toBeTruthy();
    expect(
      contents.some(
        name => name === 'gatsby-config.js.__vercel_builder_backup__.js'
      )
    ).toBeFalsy();

    expect(require(path.join(workPath, 'gatsby-config.js')))
      .toMatchInlineSnapshot(`
      Object {
        "plugins": Array [
          Object {
            "options": Object {},
            "resolve": "gatsby-plugin-vercel",
          },
        ],
      }
    `);
  },
  FOUR_MINUTES
);

it(
  'Should build Gatsby with configuration but no plugins',
  async () => {
    const { workPath } = await runBuildLambda(
      path.join(__dirname, 'build-fixtures/02-gatsby-user-config')
    );

    const contents = await fs.readdir(workPath);

    expect(contents.some(name => name === 'gatsby-config.js')).toBeTruthy();
    expect(
      contents.some(
        name => name === 'gatsby-config.js.__vercel_builder_backup__.js'
      )
    ).toBeTruthy();

    expect(require(path.join(workPath, 'gatsby-config.js')))
      .toMatchInlineSnapshot(`
      Object {
        "plugins": Array [
          Object {
            "options": Object {},
            "resolve": "gatsby-plugin-vercel",
          },
        ],
        "siteMetadata": Object {
          "author": "@gatsbyjs",
          "description": "Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.",
          "title": "Gatsby Default Starter",
        },
      }
    `);
  },
  FOUR_MINUTES
);

it(
  'Should build Gatsby with configuration that has plugins',
  async () => {
    const { workPath } = await runBuildLambda(
      path.join(__dirname, 'build-fixtures/03-gatsby-with-plugins')
    );

    const contents = await fs.readdir(workPath);

    expect(contents.some(name => name === 'gatsby-config.js')).toBeTruthy();
    expect(
      contents.some(
        name => name === 'gatsby-config.js.__vercel_builder_backup__.js'
      )
    ).toBeTruthy();

    expect(require(path.join(workPath, 'gatsby-config.js')))
      .toMatchInlineSnapshot(`
      Object {
        "plugins": Array [
          "gatsby-plugin-react-helmet",
          Object {
            "options": Object {},
            "resolve": "gatsby-plugin-vercel",
          },
        ],
        "siteMetadata": Object {
          "author": "@gatsbyjs",
          "description": "Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.",
          "title": "Gatsby Default Starter",
        },
      }
    `);
  },
  FOUR_MINUTES
);

it(
  'Should build Gatsby with configuration that already has plugin (simple)',
  async () => {
    const { workPath } = await runBuildLambda(
      path.join(__dirname, 'build-fixtures/04-gatsby-no-dupe-simple')
    );

    const contents = await fs.readdir(workPath);

    expect(contents.some(name => name === 'gatsby-config.js')).toBeTruthy();
    expect(
      contents.some(
        name => name === 'gatsby-config.js.__vercel_builder_backup__.js'
      )
    ).toBeTruthy();

    expect(require(path.join(workPath, 'gatsby-config.js')))
      .toMatchInlineSnapshot(`
      Object {
        "plugins": Array [
          "gatsby-plugin-vercel",
        ],
        "siteMetadata": Object {
          "author": "@gatsbyjs",
          "description": "Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.",
          "title": "Gatsby Default Starter",
        },
      }
    `);
  },
  FOUR_MINUTES
);

it(
  'Should build Gatsby with configuration that already has plugin (advanced)',
  async () => {
    const { workPath } = await runBuildLambda(
      path.join(__dirname, 'build-fixtures/05-gatsby-no-dupe-advanced')
    );

    const contents = await fs.readdir(workPath);

    expect(contents.some(name => name === 'gatsby-config.js')).toBeTruthy();
    expect(
      contents.some(
        name => name === 'gatsby-config.js.__vercel_builder_backup__.js'
      )
    ).toBeTruthy();

    expect(require(path.join(workPath, 'gatsby-config.js')))
      .toMatchInlineSnapshot(`
      Object {
        "plugins": Array [
          Object {
            "options": Object {},
            "resolve": "gatsby-plugin-vercel",
          },
        ],
        "siteMetadata": Object {
          "author": "@gatsbyjs",
          "description": "Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.",
          "title": "Gatsby Default Starter",
        },
      }
    `);
  },
  FOUR_MINUTES
);

it(
  'Should build Gatsby with configuration that has export default',
  async () => {
    const { workPath } = await runBuildLambda(
      path.join(__dirname, 'build-fixtures/06-gatsby-export-default')
    );

    const contents = await fs.readdir(workPath);

    expect(contents.some(name => name === 'gatsby-config.js')).toBeTruthy();
    expect(
      contents.some(
        name => name === 'gatsby-config.js.__vercel_builder_backup__.js'
      )
    ).toBeTruthy();

    expect(require(path.join(workPath, 'gatsby-config.js')))
      .toMatchInlineSnapshot(`
      Object {
        "plugins": Array [
          "gatsby-plugin-react-helmet",
          Object {
            "options": Object {},
            "resolve": "gatsby-plugin-vercel",
          },
        ],
        "siteMetadata": Object {
          "author": "@gatsbyjs",
          "description": "Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.",
          "title": "Gatsby Default Starter",
        },
      }
    `);
  },
  FOUR_MINUTES
);

it(
  'Should build Gatsby with "gatsby-plugin-zeit-now" plugin',
  async () => {
    const { workPath } = await runBuildLambda(
      path.join(__dirname, 'build-fixtures/07-gatsby-with-now-plugin')
    );

    const contents = await fs.readdir(workPath);

    expect(contents.some(name => name === 'gatsby-config.js')).toBeTruthy();

    expect(require(path.join(workPath, 'gatsby-config.js')))
      .toMatchInlineSnapshot(`
      Object {
        "plugins": Array [
          Object {
            "options": Object {
              "globalHeaders": Object {
                "x-some-header": "some-value",
              },
            },
            "resolve": "gatsby-plugin-zeit-now",
          },
          Object {
            "options": Object {},
            "resolve": "gatsby-plugin-vercel",
          },
        ],
        "siteMetadata": Object {
          "author": "@gatsbyjs",
          "description": "Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.",
          "title": "Gatsby Default Starter",
        },
      }
    `);
  },
  FOUR_MINUTES
);

it(
  'Should build Gatsby with configuration defined in typescript',
  async () => {
    const { workPath } = await runBuildLambda(
      path.join(__dirname, 'build-fixtures/13-gatsby-with-typescript-config')
    );

    const contents = await fs.readdir(workPath);

    expect(contents.some(name => name === 'gatsby-config.js')).toBeFalsy();
    expect(contents.some(name => name === 'gatsby-config.ts')).toBeTruthy();

    expect(require(path.join(workPath, 'gatsby-config.ts')))
      .toMatchInlineSnapshot(`
      Object {
        "default": Object {
          "plugins": Array [
            Object {
              "options": Object {},
              "resolve": "gatsby-plugin-vercel",
            },
          ],
          "siteMetadata": Object {
            "siteUrl": "https://gatsby-typescript-config.vercel.app",
            "title": "Gatsby Typescript Config",
          },
        },
      }
    `);
  },
  FOUR_MINUTES
);

it(
  'Should build Nuxt.js with "@nuxtjs/web-vitals" plugin',
  async () => {
    const fixture = path.join(__dirname, 'build-fixtures/08-nuxtjs-default');
    const { workPath } = await runBuildLambda(fixture);

    // The `.nuxtrc` file should contain the plugin in `modules[]`
    const rc = await fs.readFile(path.join(workPath, '.nuxtrc'), 'utf8');
    expect(rc.includes('modules[]=@nuxtjs/web-vitals')).toBeTruthy();

    // The `package.json` file should have the plugin listed as a dependency
    const pkg = require(path.join(workPath, 'package.json'));
    expect(pkg.dependencies['@nuxtjs/web-vitals']).toBe('latest');
  },
  FOUR_MINUTES
);
