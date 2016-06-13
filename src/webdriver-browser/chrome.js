/*
  Copyright 2016 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

const fs = require('fs');
const path = require('path');
const which = require('which');
const seleniumChrome = require('selenium-webdriver/chrome');
const WebDriverBrowser = require('./web-driver-browser');
const application = require('../application-state.js');

/**
 * <p>Handles the prettyName and executable path for Chrome browser.</p>
 *
 * @private
 * @extends WebDriverBrowser
 */
class ChromeWebDriverBrowser extends WebDriverBrowser {
  constructor(release) {
    let prettyName = 'Google Chrome';

    if (release === 'stable') {
      prettyName += ' Stable';
    } else if (release === 'beta') {
      prettyName += ' Beta';
    } else if (release === 'unstable') {
      prettyName += ' Dev / Canary';
    }

    super(
      prettyName,
      release,
      'chrome',
      new seleniumChrome.Options()
    );
  }

  _findInInstallDir() {
    let defaultDir = application.getInstallDirectory();
    let chromeSubPath = 'chrome/google-chrome';
    if (this._release === 'beta') {
      chromeSubPath = 'chrome-beta/google-chrome-beta';
    } else if (this._release === 'unstable') {
      chromeSubPath = 'chrome-unstable/google-chrome-unstable';
    }

    const expectedPath = path.join(
      defaultDir, 'chrome', this._release, 'opt/google/',
      chromeSubPath);
    try {
      // This will throw if it's not found
      fs.lstatSync(expectedPath);
      return expectedPath;
    } catch (error) {}
    return null;
  }

  /**
   * Returns the executable for the browser
   * @return {String} Path of executable
   */
  getExecutablePath() {
    const installDirExecutable = this._findInInstallDir();
    if (installDirExecutable) {
      // We have a path for the browser
      return installDirExecutable;
    }

    try {
      if (this._release === 'stable') {
        if (process.platform === 'darwin') {
          return '/Applications/Google Chrome.app/' +
            'Contents/MacOS/Google Chrome';
        } else if (process.platform === 'linux') {
          return which.sync('google-chrome');
        }
      } else if (this._release === 'beta') {
        if (process.platform === 'darwin') {
          return '/Applications/Google Chrome Beta.app/' +
            'Contents/MacOS/Google Chrome Beta';
        } else if (process.platform === 'linux') {
          return which.sync('google-chrome-beta');
        }
      } else if (this._release === 'unstable') {
        if (process.platform === 'darwin') {
          return '/Applications/Google Chrome Canary.app/' +
            'Contents/MacOS/Google Chrome Canary';
        } else if (process.platform === 'linux') {
          return which.sync('google-chrome-unstable');
        }
      }
    } catch (err) {}

    return null;
  }

  /**
   * A version number for the browser. This is the major version number
   * (i.e. for 48.0.1293, this would return 18)
   * @return {Integer} The major version number of this browser
   */
  getVersionNumber() {
    const chromeVersion = this.getRawVersionString();
    if (!chromeVersion) {
      return -1;
    }

    const regexMatch = chromeVersion.match(/(\d+).\d+.\d+.\d+/);
    if (regexMatch === null) {
      console.warn('Unable to parse version number from Firefox',
        this._executablePath);
      return -1;
    }

    return parseInt(regexMatch[1], 10);
  }
}

module.exports = ChromeWebDriverBrowser;