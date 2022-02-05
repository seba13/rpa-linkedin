import time
from datetime import datetime


def main():
    while True:
        print("ciclo de prueba...")
        print(datetime.now())
        time.sleep(10)

if __name__ == '__main__':
    main()
