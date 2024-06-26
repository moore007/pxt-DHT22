enum dht22type {
    //% block="Celsius"
    Celsius,
    //% block="Fahrenheit"
    Fahrenheit,
    //% block="humidity"
    humidity
}

enum mbVersion {
    //% block="V1"
    v1,
    //% block="V2"
    v2
}

//% color=#F6421B icon="\uf2c9" block="DHT22"
namespace DHT22 {
    let temp_C = -999
    let temp_F = -999
    let humid = -999
    let counter_limit = 2

    let pin = DigitalPin.P0
    function signal_dht22(pin: DigitalPin): void {
        pins.digitalWritePin(pin, 0)
        basic.pause(18)
        pins.digitalReadPin(pin)
        pins.setPull(pin, PinPullMode.PullUp)
    }

    //% block="Choose micro:bit version %mbver"
    //% weight=1000
    export function microbitVersion(mbver: mbVersion) {
        switch (mbver) {
            case 0:
                counter_limit = 2
                break
            case 1:
                counter_limit = 12
                break
            default:
        }
    }

    /**
     * Set up the sensor and start reading data.
     *
     */
    //% block="READ DHT22 pin %pin_arg"
    //% pin_arg.fieldEditor="gridpicker" pin_arg.fieldOptions.columns=5
    //% pin_arg.fieldOptions.tooltips="false"
    //% weight=100
    export function dht22_read(pin_arg: DigitalPin) {
        basic.pause(2000)
        pin = pin_arg
        signal_dht22(pin)

        // Wait for response header to finish
        while (pins.digitalReadPin(pin) == 1);
        while (pins.digitalReadPin(pin) == 0);
        while (pins.digitalReadPin(pin) == 1);

        let counter = 0
        let humid_raw = 0
        let temp_raw = 0
        let check_sum = 0

        let timeOut = false

        for (let i = 0; i <= 40 - 1; i++) {
            while (pins.digitalReadPin(pin) == 0);
            counter = 0
            while (pins.digitalReadPin(pin) == 1) {
                counter += 1;
                if (counter > 5000) {
                    //basic.showNumber(0)
                    timeOut = true
                    break
                }
            }

            if (timeOut) {
                break
            }

            if (counter > counter_limit) {
                if (i < 16) {
                    humid_raw = humid_raw + (1 << (15 - i));
                }
                else if (i < 32) {
                    temp_raw = temp_raw + (1 << (31 - i))
                }
                else {
                    check_sum = check_sum + (1 << (39 - i))
                }
            }
        }

        if (!timeOut) {
            temp_C = temp_raw / 10
            temp_F = temp_C * 9 / 5 + 32
            humid = humid_raw / 10

            //basic.clearScreen()
        }


    }

    //% block="data %data_type"
    export function data(data_type: dht22type): number {
        switch (data_type) {
            case 0:
                return temp_C
            case 1:
                return temp_F
            case 2:
                return humid
            default:
                return -999
        }
    }
}