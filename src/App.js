import React, { Component } from "react";
import { Admin, Resource } from "react-admin";

import "./App.css";

import authProvider from "./authProvider";
import { Login, Layout } from "./layout";
import { Dashboard } from "./dashboard";
import englishMessages from "./i18n/en";

import visitors from "./visitors";

import dataProviderFactory from "./dataProvider";
import fakeServerFactory from "./fakeServer";

const i18nProvider = locale => {
  if (locale === "fr") {
    return import("./i18n/fr").then(messages => messages.default);
  }

  // Always fallback on english
  return englishMessages;
};

class App extends Component {
  state = { dataProvider: null };

  async componentWillMount() {
    this.restoreFetch = await fakeServerFactory();
    const dataProvider = await dataProviderFactory();

    this.setState({ dataProvider });
  }

  componentWillUnmount() {
    this.restoreFetch();
  }

  render() {
    const { dataProvider } = this.state;

    if (!dataProvider) {
      return (
        <div className="loader-container">
          <div className="loader">Loading...</div>
        </div>
      );
    }

    return (
      <Admin
        title=""
        dataProvider={dataProvider}
        authProvider={authProvider}
        dashboard={Dashboard}
        loginPage={Login}
        appLayout={Layout}
        locale="en"
        i18nProvider={i18nProvider}
      >
        <Resource name="customers" {...visitors} />
      </Admin>
    );
  }
}

export default App;
