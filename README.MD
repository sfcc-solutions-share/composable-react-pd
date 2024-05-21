# Extensible Composable Storefront React Page Designer

Project extracted from [composable-storefront-pocs](https://github.com/SalesforceCommerceCloud/composable-storefront-pocs)

This project implements Page Designer for Composable Storefront using a react-only component approach. It is a standalone
version of the solution in the above repository with isolated setup instructions. 
See that repository for additional features and automated setup scripts. This version includes the minimal necessary setup for the solution as
an [extensible](https://developer.salesforce.com/docs/commerce/pwa-kit-managed-runtime/guide/template-extensibility.html) composable storefront override.

## How It Works

This solutions runs your composable storefront (pwa-kit) application from within B2C Page Designer. This differs
from the out of the box page designer solution which relies on using traditional ISML (i.e. SFRA) copies of your PD components
for rendering in page designer. In this way we can have high-fidelity preview from within the page designer application and can
utilize the preview (customer group, date/time, source code) preview functions.

- Services are installed on the B2C instance to provide private client SLAS and SCAPI proxy support.
- A cartridge (`app_q_pwa_support`) includes a number of example page designer components, example custom editors, and a
  "harness" script (`cartridges/app_q_pwa_support/cartridge/client/default/js/harness.js`) that imports pwa-kit
- The `harness.js` script is loaded by the page designer page `headlessPage.isml` and initializes the pwa-kit application
  with a configuration based on the current site and service configuration
- Before loading the application the private SLAS client is used to pre-fetch a JWT to be used by pwa-kit. Additionally
  shopper-context is set for this USID to match the current preview context of page designer. In this way pwa-kit is
  loaded and executes under the same context as the page designer preview without the need for reloading.
- Finally, the page container (`pageDesignerPageContainer.js`) loaded by the harness will ensure that the pwa-kit application
  is loaded with the correct page designer page by intercepting requests to the shopper-experience API if it matches the page
  being edited. This allows us to preview even unpublished pages which are not supported by the API natively.

## Setup

You can clone this repository or copy the necessary requirements from it. In the instructions below
we mention the changes required to your existing project to support this solution. These changes are already
included in this repository.

### Feature Toggles

1. Ensure your instance has the `Enable Shopper Context` feature toggle enabled.

### SLAS Setup

Using the SLAS Admin UI or API create or update a private SLAS client. *NOTE: You can use the same client you already use for
MRT storefront preview purposes, although we require additional scopes*.

1. Configure your pwa-kit public client as normal
1. Configure/create your SLAS Private Client with the following scopes.
    - sfcc.shopper-categories
    - sfcc.shopper-customers.register
    - sfcc.shopper-customers.login
    - sfcc.shopper-myaccount
    - sfcc.shopper-myaccount.rw
    - sfcc.shopper-myaccount.addresses.rw
    - sfcc.shopper-myaccount.addresses
    - sfcc.shopper-myaccount.baskets
    - sfcc.shopper-myaccount.orders
    - sfcc.shopper-myaccount.paymentinstruments.rw
    - sfcc.shopper-myaccount.paymentinstruments
    - sfcc.shopper-myaccount.productlists
    - sfcc.shopper-myaccount.productlists.rw
    - sfcc.shopper-productlists
    - sfcc.shopper-promotions
    - sfcc.shopper-gift-certificates
    - sfcc.shopper-product-search
    - sfcc.shopper-baskets-orders.rw
    - sfcc.shopper-baskets-orders
    - sfcc.shopper-experience
    - sfcc.shopper-products
    - sfcc.session_bridge
    - sfcc.shopper-context.rw
    - sfcc.ts_ext_on_behalf_of

### Metadata

1. 2 B2C services (and their respective credentials and profile) are required. Import the `metadata` folder via site import/export or import the `metadata/services.xml` directly
1. Configure the `scapi.slas.private` service credential
    - **URL**:
        - Replace **SHORT_CODE** with your SCAPI **Short Code** (e.g.: `kv7kzm78`)
        - Replace **ORG_ID** with your SCAPI **Organization ID** (e.g.: `f_ecom_zzte_053`)
        - Example: `https://kv7kzm78.api.commercecloud.salesforce.com/shopper/auth/v1/organizations/f_ecom_zzte_053/oauth2/token`
    - **User**: Your _private_ SLAS **client ID** created above
    - **Password**: Your _private_ **SLAS client secret** created above
1. Configure the `scapi.shopper` service credential
    - **URL**:
        - Replace **SHORT_CODE** with your SCAPI **Short Code** (e.g.: `kv7kzm78`)
        - Example: `https://kv7kzm78.api.commercecloud.salesforce.com/`

### pwa-kit Setup

1. Copy the following files/folders to your project overrides (or `app/` for non-extensible projects) folder.
   - `overrides/app/components/banner`
   - `overrides/app/components/product-tile-dynamic`
   - `overrides/app/components/page-designer`
   - `overrides/app/pages/page`
   - `overrides/app/routes.jsx`
     - This implements the `'/page/:pageId` route. You can add this to your existing routes
1. Add the additional dependencies to your `package.json` (Note: these are used for the custom editors and example components)
    ```json
        "@salesforce/design-system-react": "^0.10.58",
        "@codemirror/commands": "^6.1.2",
        "@codemirror/lang-html": "^6.1.1",
        "@codemirror/lang-javascript": "^6.1.1",
        "@codemirror/lang-json": "^6.0.1",
        "@codemirror/state": "^6.1.4",
        "@codemirror/view": "^6.5.1",
        "@uiw/react-codemirror": "^4.19.7",
        "codemirror": "^6.0.1",
        "htm": "^3.1.1",
        "mini-css-extract-plugin": "^2.7.2",
        "react-jsx-parser": "^1.29.0",
        "style-loader": "^3.3.1",
    ```
1. Add npm overrides to your `package.json` (this fixes an issue with the `@salesforce/design-system-react` package)
    ```json
    "overrides": {
        "@salesforce-ux/design-system": "2.22.2"
    }
    ```
1. Install the project dependencies
   ```bash
   npm install
   ```
1. Ensure the project builds
   ```bash
   npm run build
   ```

### Cartridge Setup

1. Copy the `cartridges/app_q_pwa_support` cartridge to your projectA (Note: you can change the name of this cartridge)
2. Copy the `webpack.harness.config.js` to your project root
3. Add the following run scripts to your `package.json` scripts keys
    ```json
    "build:harness": "HMR=false webpack-cli --config webpack.harness.config.js",
    "watch:harness": "HMR=false webpack-cli --config webpack.harness.config.js --watch"
    ```
4. Run the build script
    ```bash
    npm run build:harness
    ```
5. Upload/deploy the cartridge to your B2C instance
6. Add the cartridge to your **Site** cartridge path
    - for example: `app_q_pwa_support:app_storefront_base`
7. Add `app_q_pwa_support` to your **Business Manager** cartridge path (this is for the page designer support and custom PD editors)
8. On your B2C instance create a `Headless Page` inside page designer. If everything works correctly you should see the pwa-kit application
   loaded inside the page designer preview window. You can click preview to browse the site as a customer would.

## Development

### Adding New Page Designer Components

1. Create the component metadata file as normal with your component fields (i.e. `app_q_pwa_support/cartridge/experience/components/headless/banner.json`)
   - You can optionally make use of the custom editors provided for container style and Chakra theme overrides. See the `__containerStyles` and `themeOverrides` attributes in the example components provides.
      If present the solution will automatically provide this functionality through higher order components.
2. Create a component script as normal. See the example `app_q_pwa_support/cartridge/experience/components/headless/banner.js`
   - Note that we do NOT need a unique `isml` file for each component. Use `experience/components/headlessComponent` instead
   - Note also the use of a serialization helper for links and images:
      ```javascript
      module.exports.serialize = headlessComponentHelper.serializeHelper()
      ```
3. Create your react frontend for the component. See the example `overrides/app/components/page-designer/headless/banner.js` as an example
4. Finally, register your component type ID to it's corresponding react component in the [overrides/app/components/page-designer/support.js](./overrides/app/components/page-designer/support.js#L23) file under the `COMPONENTS` constant
5. Rebuild the harness and upload the cartridge to your B2C instance
   - Note: you can use the `npm run watch:harness` script to watch for changes and rebuild automatically just like `npm start` is used for pwa-kit

### Caveats

- There are some differences between the data used in page designer and in the experience API. Namely, image type attributes contain a `path` in PD and a `url` in experience. For this it's recommended to use the `disBaseLink` custom attribute instead.
  - An alternative is to use the experience API directly by disabling these lines: [./overrides/app/components/page-designer/pageDesignerPageContainer.js](./overrides/app/components/page-designer/pageDesignerPageContainer.js#L88). The side effect is that
    you must PUBLISH your page to edit it.

## License

Licensed under the current NDA and licensing agreement in place with your organization. (This is explicitly **not** open
source licensing.) This solution is based on code available at https://github.com/SalesforceCommerceCloud/pwa-kit using the BSD 3-clause license.

### Support

**This project should not be treated as Salesforce Product.** It is an example implementation of composable storefront and
related tools. Customers and partners implement this at-will with no expectation of roadmap, technical support,
defect resolution, production-style SLAs.

This project is maintained by the **Salesforce Community**. Salesforce Commerce Cloud or Salesforce Platform Technical
Support do not support this project or its setup.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.

For feature requests or bugs, please open a [GitHub issue](https://github.com/SalesforceCommerceCloud/composable-storefront-pocs/issues). 

