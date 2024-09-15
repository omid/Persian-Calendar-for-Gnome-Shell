## Persian Calendar for *Gnome-Shell*

An extension for Gnome-Shell to show Persian date and calendar

![Screenshot](https://github.com/omid/Persian-Calendar-for-Gnome-Shell/blob/master/assets/screenshot.png?raw=true)

### Installation:

#### Recommended way:
* Go to the official Gnome Shell Extensions website: https://extensions.gnome.org/extension/240/
* Click on the “ON/OFF” button on the top-right of the page.
* If you don't see the extension, go to the [troubleshooting section](README.md#troubleshooting).

#### For developers:
* Clone the repository
* Go to the cloned directory
* run `make` command in the terminal
* Restart Gnome-shell. (ALT+F2, r, Enter)
* You may need to enable the extension via GNOME `Extensions` application

### Troubleshooting:
* I don't see the ON/OFF button, or it's disabled, but I see a blue message on top of the website, with a message like: “To control GNOME Shell extensions using this site you must install GNOME Shell integration that…”. What should I do?
   * In this case, you must install the `chrome-gnome-shell` package on your system. For example, on Ubuntu, you should run: `sudo apt install chrome-gnome-shell`
* I enable the extension, but it doesn't appear and when I refresh the page, it's disabled again! Why?!
   * If you don't have `gnome-tweaks`, first install it. Then open it and go to the “extensions” section. There is a button in the title bar of the window, make sure it's enabled.
   * If you cannot see the “extensions” section in the `gnome-tweaks` application, congratulation, you are using a more up-to-date version of Gnome, so in this case, please use the `gnome-extensions` application and make sure the button is enabled.
* If none of the above works, you can install [Extension Manager](https://github.com/mjakeman/extension-manager#-installing), then install and activate the Persian Calendar extension through it. Extension Manager is a tool for managing GNOME Shell Extensions.
* The extension seems to work, but the settings window in extension manager reports the following message "Error: Requiring Clutter, version none: Typelib file for namespace '`Clutter'"
   * This error is a result of some clutter libraries no longer being bundled with your OS if you use Ubuntu, please open a terminal and execute 
   `$sudo apt install -y gir1.2-gtkclutter-1.0`
   * Or equivalent command for your distribution, and restart your windows manager or log out and log back in.

### Date formatting:
| Format Code | Meaning | Example Output |
| ----------- | ------- | -------------- |
| `%Y` | Year with century | `۱۴۰۲` |
| `%y` | Year without century (zero-padded) | `۰۲` |
| `%MM` | Month name | `آبان` |
| `%mm` | Month name (short) | `آبا` |
| `%M` | Month number (zero-padded) | `۰۸` |
| `%m` | Month number | `۸` |
| `%D` | Day of the month (zero-padded) | `۰۱` |
| `%d` | Day of the month | `۱` |
| `%WW` | Day of the week | `چهارشنبه` |
| `%ww` | Day of the week (short) | `چهار` |
| `%w` | Day of the week (very short) | `چ` |


### Links:
* :octocat: https://github.com/omid/Persian-Calendar-for-Gnome-Shell
* :link: https://extensions.gnome.org/extension/240/
* :yum: https://www.paypal.me/omidmr/

[Developed with :green_heart:](https://github.com/omid/Persian-Calendar-for-Gnome-Shell/graphs/contributors)
