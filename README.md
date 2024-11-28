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
1. I don't see the ON/OFF button, or it's disabled, but I see a blue message on top of the website, with a message like: “To control GNOME Shell extensions using this site you must install GNOME Shell integration that…”. What should I do?
   * In this case, you must install the `gnome-browser-connector` package on your system. For example, on Ubuntu, you should run: `apt install gnome-browser-connector`
2. I enable the extension, but it doesn't appear and when I refresh the page, it's disabled again! Why?!
   * Run `gnome-extensions` application and make sure extensions are enabled and the toggle in front of the extension is turned on also.
3. The extension works, but the settings window reports the following message "Error: Requiring Clutter, version none: Typelib file for namespace '`Clutter'"
   * This error is a result of some missing clutter libraries. You need to install clutter integration of GTK. A command like this `apt install -y gir1.2-gtkclutter-1.0` or `pacman -S clutter-gtk` may help.

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

[Developed with :green_heart:](https://github.com/omid/Persian-Calendar-for-Gnome-Shell/graphs/contributors)

### Links:
* :octocat: https://github.com/omid/Persian-Calendar-for-Gnome-Shell
* :link: https://extensions.gnome.org/extension/240/
* :yum: https://www.paypal.me/omidmr/
