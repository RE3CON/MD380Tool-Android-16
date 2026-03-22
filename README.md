# MD380 Web Management Suite

A modern, web-based management tool for the Tytera MD-380 and MD-390 DMR radios. This suite allows for firmware flashing, user database synchronization, and system diagnostics directly from your browser using WebUSB.

## 🚀 Key Features

- **WebUSB Flashing**: Flash firmware binaries directly without installing complex driver stacks.
- **DMR User Database**: Sync the latest global DMR user registry to your device.
- **Android 16 Support**: Patched for the latest mobile operating systems and high-speed USB chipsets (Snapdragon 8 Gen 3).
- **Firmware Archive**: Access to stable, community-vetted binaries.

## 🛠 Firmware Options

### [Foxhollow Experimental (Latest 2025)](https://web1.foxhollow.ca/DMR/?menu=experimental)
**The current recommended build (v2025-01-13).** This is the most up-to-date experimental firmware for MD380/390 and RT3/RT8. It includes the latest community patches, full DMR user database support, and optimized UI features.
- **[Direct Directory Listing](https://web1.foxhollow.ca/DMR/TYT/Firmware/Experimental/)**: Access raw firmware binaries.

### [KD4Z md380tools (Non-GPS)](https://github.com/DMR-Database/md380tools/blob/master/firmware-noGPS.bin)
The community standard firmware. Highly stable and widely used. Includes:
- Promiscuous mode (hear all traffic on a time slot)
- Enhanced Mic Gain settings
- Detailed UI with signal strength and talkgroup info
- Custom boot screens

### [OpenRTX (Alternative)](https://openrtx.org/)
A free and open-source firmware for digital ham radios. It supports the M17 digital voice protocol and provides a completely modern, modular UI.
- **GitHub**: [OpenRTX/OpenRTX](https://github.com/OpenRTX/OpenRTX)

### [Alternative Firmware Archive](https://md380.org/firmware/orig/)
A repository of various historical and experimental firmware versions.

## 🆘 Recovery & Stock Firmware

### [Original Stock Firmware (v03.13.19)](https://www.miklor.com/DMR/Toolz/nongps_fw_031319.bin)
**LAST RESORT.** Factory original firmware for MD-380 (Non-GPS). Use this ONLY for troubleshooting, emergency recovery, or returning the device to its factory state.

## 📚 Resources & Documentation

### [KG5RKI Download Archive](https://kg5rki.com/new2/index.php)
**The Gold Standard for Binaries.** KG5RKI maintains the most comprehensive archive of DMR tools, drivers, and firmware versions. If you are looking for a specific historical version or a niche driver, this is the place to find it.

### [TyMD380Toolz PDF Guide](https://www.miklor.com/DMR/pdf/TyMD380Toolz.pdf)
A detailed manual covering the installation and feature set of the MD380Toolz enhancement suite.

### [DL4YHF Firmware Documentation](https://www.qsl.net/dl4yhf/RT3/md380_fw.html)
Technical documentation and firmware modification notes by DL4YHF for the MD-380 and RT3.

### [EvoHam Programming & Firmware Guide](https://evoham.com/dmr-programming-software-firmware/)
A comprehensive resource for DMR programming software, firmware updates, and setup instructions for various DMR radios including the MD-380.

### [DARC MD380-Toolz Installation Guide (German)](https://www.darc.de/fileadmin/filemounts/distrikte/n/ortsverbaende/20/Downloads/DMR-Software/Installation-und-Benutzung-MD380-Toolz.pdf)
A detailed German-language guide from DARC (Deutscher Amateur-Radio-Club) on the installation and use of MD380-Toolz.

### [Media2000 MD-380 Resource Hub](https://www.media2000.org/1203/)
A long-standing community resource providing firmware updates, tools, and user database files specifically for the Tytera MD-380.

### [Media2000 Tools & Guides](https://www.media2000.org/1197/)
Additional tools, software, and detailed guides for the MD-380 provided by the Media2000 community.

### [Main Repository (DMR-Database)](https://github.com/DMR-Database/md380tools.git)
The primary source code and build environment for the current md380tools project.

### [Original Repository (Travis Goodspeed)](https://github.com/travisgoodspeed/md380tools.git)
The pioneering repository by Travis Goodspeed that started the MD-380 firmware reverse engineering project. This repository contains the foundational research on the C5000 baseband and the original patches that enabled promiscuous mode, custom boot screens, and advanced UI features. It remains the historical source of truth for the project's origins.

### [TYT Official Download Center](https://www.tyt888.com/download.html)
The official manufacturer's website for Tytera (TYT). Access factory CPS (Customer Programming Software), USB drivers, and official firmware updates for the MD-380 and other models.

### [DC7JZB MD380Tools Tutorial (German)](https://dc7jzb.de/tutorials/funkgeraete/tytera-md380/funktionen-der-md380tools/)
A comprehensive German-language guide explaining the various functions and features of the md380tools firmware enhancement.

### [md380tools German Documentation](https://github.com/travisgoodspeed/md380tools/blob/master/README.de.md)
The official German-language README for the original md380tools project by Travis Goodspeed. It provides a detailed overview of the project's goals, installation steps, and technical details in German.

### [DL-Nordwest M17 Modification Report (German)](https://dl-nordwest.com/index.php/2025/03/23/modifikation-eines-tyt-md380-retevis-rt3-fuer-m17-erfahrungsbericht/)
An experience report and technical guide on modifying the Tytera MD-380 / Retevis RT3 for the M17 digital voice protocol.

### [KG5RKI TyMD380Tools Resources](https://kg5rki.com/new2/tymd380.html)
A collection of essential tools and documentation maintained by KG5RKI:
- **[TyMD380Toolz Documentation](https://kg5rki.com/MD380_AIO/TyMD380Toolz.pdf)**: Detailed PDF manual for the Toolz suite.
- **[MD380/MD390 non-GPS Firmware](https://kg5rki.com/MD380_AIO/experiment.bin)**: Experimental firmware for non-GPS models.
- **[MD380/MD390 GPS Firmware](https://kg5rki.com/MD380_AIO/experiment_GPS.bin)**: Experimental firmware for GPS models.
- **[Tytera Flash Tool v1.05](https://kg5rki.com/MD380_AIO/TyteraFlashToolv1_05.zip)**: All-in-one utility for user database and firmware updates.
- **[Tytera Flash Tool v1.08c BETA](https://kg5rki.com/MD380_BETA/TyteraFlashTool_v1_08c_BETA.zip)**: Latest beta version of the flash tool.
- **[MD380Toolz Android App](https://kg5rki.com/MD380_AIO/TyMD380Toolz.apk)**: Flash firmware from Android via OTG cable.
- **[Stock Firmware Download URLs](https://github.com/travisgoodspeed/md380tools/blob/master/firmware/firmware_files.txt)**: Direct links to official stock firmware files.

### [BrandMeister MD380 Support Wiki](https://wiki.brandmeister.network/index.php/MD380_Support)
Official BrandMeister documentation regarding MD380 tools support, specifically focusing on **Special IDs** (Talkgroups/IDs dictionary). It explains how the `md380tools` suite handles centralized user IDs and local master-server-specific special IDs (like Parrot/Echo services) across different countries.

### [DMR MD380 Toolz Made Easy (SBARC)](https://www.sbarc.org/Downloads/DMR/Firmware/DMR%20MD380%20Toolz%20Made%20Easy.pdf)
A simplified, step-by-step guide provided by the Santa Barbara Amateur Radio Club (SBARC) for installing and using the MD380Toolz enhancement suite.

### [DARC District E29 Download Center (German)](https://www.darc.de/der-club/distrikte/e/ortsverbaende/29/download/)
A regional resource from the German Amateur Radio Club (DARC) providing local firmware updates, codeplugs, and tools for DMR users in the Hamburg/District E area.

### [QSP 04-2017 MD380 Firmware Article (German)](http://firac.at/oe7bsh/QSP_04-2017_md380fw.pdf)
An article from the Austrian amateur radio magazine QSP (April 2017) detailing the installation and features of the md380tools firmware.

### [KD4Z Toolkit Facebook Group](https://www.facebook.com/groups/KD4ZToolkit/)
The primary community hub for the KD4Z Toolkit. This group is the best place to find the latest custom firmware builds, community support, and troubleshooting tips for the MD-380/390.

### [Buy Two Way Radios - TYT MD-UV380 Software & Drivers](https://www.buytwowayradios.com/tyt-md-uv380.html)
A reliable source for official TYT software and USB drivers. Recommended for **Windows 10 Pro** users to ensure correct driver installation and device recognition.

### [MD380Tools Firmware V01.34 (Archive)](https://kg5rki.com/MD380_AIO/experiment.bin)
A specific version of the enhanced firmware (V01.34) often used for its stable feature set.

### [Adafruit Tytera MD-380 DMR Guide](https://cdn-learn.adafruit.com/downloads/pdf/tytera-md-380-dmr.pdf)
A comprehensive learning guide from Adafruit covering the basics of DMR and the Tytera MD-380 radio.

### [SQ9JDO MD-380 Tools Guide (Polish)](https://sq9jdo.com.pl/MD-380/MD-380_Tools/md380tools_1.html)
A detailed Polish-language guide for updating experimental firmware and using md380tools.

### [MD380-MD390 Windows Radio Updater](https://web1.foxhollow.ca/DMR/Files/Firmware/MD380-MD390-Windows-Radio-Updater.zip)
A standalone Windows utility for flashing firmware to MD-380 and MD-390 radios.

### [MD380.org Daily Releases](https://md380.org/releases/daily/)
The official daily build repository for md380tools, providing the latest experimental firmware features.

### [Travis Goodspeed / md380tools (GitHub)](https://github.com/travisgoodspeed/md380tools.git)
The pioneering repository for MD-380 firmware reverse engineering and C5000 baseband research.

### [win380-390-tools (wh6av)](https://github.com/wh6av/win380-390-tools.git)
A collection of Windows-based utilities for managing MD-380 and MD-390 radios, including firmware flashing and user database synchronization tools.

### [KD4Z md380tools-vm](https://github.com/KD4Z/md380tools-vm)
A pre-configured VirtualBox Virtual Machine that provides a complete Linux build environment for `md380tools`. This is the easiest way for developers to set up a stable environment for compiling custom firmware patches without manually installing dependencies.

### [SwissDMR MD380/390 Resources](https://swissdmr.ch/wordpress/?page_id=1759)
Provides experimental firmware versions (D13 for standard, S13 for GPS) and the official **[CPS v1.37 Setup](https://swissdmr.ch/download/tytera/CPS-TYT-setup_v1_37.zip)** for programming the radio.

### [Einstein.amsterdam MD380 Firmware](https://einstein.amsterdam/?page_id=316)
A technical resource for firmware installation and known model variations of the MD-380/390 series.

### [Adafruit: Updating MD-380 Firmware](https://learn.adafruit.com/tytera-md-380-dmr/updating-md-380-firmware)
A beginner-friendly, step-by-step guide by Ladyada on how to enter DFU mode, install drivers, and flash patched firmware using community tools.

### [DL4YHF: MD380 Firmware Overview](https://www.qsl.net/dl4yhf/RT3/md380_fw.html)
A deep technical dive into the firmware's internals. Includes C source code analysis, diagnostic function documentation (USB access to C5000 registers), and disassembly guides using Radare2. Essential for developers and advanced hackers.

### [Foxhollow Experimental Firmware](https://web1.foxhollow.ca/DMR/?menu=experimental)
The latest experimental firmware (currently version **2025-01-13**) for MD380/390 and RT3/RT8. This repository provides daily builds and archived experimental firmware files.
- **[Direct Directory Listing](https://web1.foxhollow.ca/DMR/TYT/Firmware/Experimental/)**: Access the raw firmware files directly.
- **[Flashing Guide](https://web1.foxhollow.ca/DMR/?menu=experimental)**: Detailed instructions for Windows users.

### [IK6DIO Backup Repository](https://www.ik6dio.it/download-2/windows/backup-firmware-for-md380390-rt38/)
An extensive archive of firmware backups and tools for the MD380/390 and RT3/RT8. This is a valuable resource for finding older stable versions or specific toolsets that may have been removed from other repositories.

### [QSP 04-2017: MD380 Firmware (German)](http://firac.at/oe7bsh/QSP_04-2017_md380fw.pdf)
An article from the Austrian amateur radio magazine QSP (April 2017) providing a detailed overview of the MD380 experimental firmware and its features.

### [TYT MD-380 Firmware - OK1PMP (Czech)](https://www.ok1pmp.eu/tyt-md-380-firmware/)
A detailed guide in Czech covering the update process for both official and experimental firmware. Includes information on vocoder versions and the Tytera Flash Tool.

### [RadioFouine Firmware Archive](https://www.radiofouine.net/downloads/Public/DMR/Tytera/MD-380/Firmwares/)
An extensive public archive containing various versions of Tytera MD-380 firmwares, including older releases and experimental builds.

### [Reverse Engineering the Tytera MD380 (KB9MWR)](https://www.qsl.net/kb9mwr/projects/dv/dmr/Reverse%20Engineering%20the%20Tytera%20MD380.pdf)
A foundational technical report detailing the hardware architecture, firmware structure, and reverse engineering efforts that enabled the `md380tools` project.

### [Hardware Mods & Technical Info (F4BQN)](http://f4bqn.free.fr/Mods-md-380.htm)
A comprehensive resource (originally in French) for hardware modifications and technical specifications of the MD-380:
- **[Mic/Speaker Connector Pinout](http://f4bqn.free.fr/Mods-MD-380/micro.htm)**: Wiring diagrams for external accessories.
- **[Internal Hardware View](http://radioaficion.com/cms/md-380-dmr/)**: Detailed photos of the radio's internal components.
- **[RF Schematic (PDF)](http://f4bqn.free.fr/Mods-MD-380/MD-380UHF_RF_schematic.pdf)**: Official circuit diagrams for the UHF RF section.
- **[Reverse Engineering Report (PDF)](http://f4bqn.free.fr/Mods-MD-380/Reverse%20Engineering%20the%20Tytera%20MD380.pdf)**: Foundational research on the radio's hardware and firmware.
- **[Official Manual (PDF)](http://f4bqn.free.fr/Mods-MD-380/MD-380_TYT_manual.pdf)**: The factory user manual.
- **[USB Driver for Windows](http://f4bqn.free.fr/Mods-MD-380/DM-380USB_Driver.zip)**: Essential drivers for device recognition.

## 🌟 Detailed Features (from md380.org)

The `md380tools` project introduces several powerful enhancements to the factory firmware:

### [Application Menu](https://md380.org/features/amenu/)
A custom menu system accessible directly from the radio's keypad. It allows users to toggle experimental features, change settings, and view diagnostic information without needing a computer.
- **Access**: Press the **Red Button** followed by the **Menu Button**.

### [Promiscuous Mode](https://md380.org/features/promiscuous/)
Allows the radio to receive and play audio for *any* Talkgroup or Color Code active on the current time slot. This is invaluable for monitoring repeaters when you don't know the specific Talkgroups in use.

### [Network Monitor (NetMon)](https://md380.org/features/netmon/)
A set of dedicated screens (NetMon 1, 2, and 3) that provide real-time information about DMR network activity.
- **NetMon 1**: Shows active Talkgroups and Caller IDs.
- **NetMon 2**: Displays signal strength and BER (Bit Error Rate).
- **NetMon 3**: Provides low-level protocol information.

### [Caller ID (CSV Database)](https://md380.org/features/callerid/)
By loading a global DMR user database (CSV format) into the radio's SPI flash, the firmware can display the name, callsign, and location of the station currently transmitting.

### [Call Log](https://md380.org/features/calllog/)
A persistent history of recently received calls. You can review who was active, what Talkgroup they used, and when the call occurred.

### [Morse Narration](https://md380.org/features/morse/)
Designed for visually impaired operators, this feature provides Morse code audio feedback for menu navigation and radio status updates.

### [Quick TG Change](https://md380.org/features/amenu/quicktgchange/)
Allows for rapid Talkgroup switching via direct keypad entry. Instead of navigating deep menus, you can simply type the TG ID and confirm.

### [Test & Setup](https://md380.org/features/amenu/testsetup/)
A suite of diagnostic tools for hardware testing, mic gain calibration, and verifying the integrity of the flashed firmware.

## 🔌 Setup Instructions (Quick Guide)

Based on resources from **SQ9JDO** and community best practices:

1. **Download Tools**: Get the **Windows Radio Updater** from the Resources section.
2. **DFU Mode**: 
   - Turn the radio **OFF**.
   - Hold the **PTT** button and the **Top Orange Button** simultaneously.
   - Turn the radio **ON**. The LED will flash red/green, indicating DFU mode.
3. **Connection**: Connect the radio to your PC using a standard MD-380 USB programming cable.
4. **Drivers**: For **Windows 10 Pro**, ensure you have installed the official drivers from **BuyTwoWayRadios**.
5. **Flash**: Run the updater, select your firmware (e.g., **V01.34**), and click **Update**.

---
*Disclaimer: Flashing firmware carries inherent risks. Ensure your device is fully charged before beginning the process.*
