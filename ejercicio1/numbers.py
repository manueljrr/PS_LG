# -*- coding: utf-8 -*-
from sys import stdin


PERFECT = 0
ABUNDANT = 1
DEFICIENT = 2

NUMBER_TYPES = {
    PERFECT: u'Perfect',
    ABUNDANT: u'Abundant',
    DEFICIENT: u'Deficient'
}


def get_divisors(num):
    """
    Get the divisors of a number 'num', except itself
    :param num: the number to get divisors
    :return: (generator) list of divisors
    """
    yield 1

    for i in range(2, num / 2 + 1):
        if not num % i:
            yield i


def get_number_type(num):
    """
    Get the type of the current number (PERFECT, ABUNDANT or DEFICIENT)
    :param num: The number to be processed
    :return: (int) The type of the number PERFECT(0), ABUNDANT(1) or DEFICIENT(2)
    """
    print list(get_divisors(num))
    divisors_sum = sum(list(get_divisors(num)))

    return PERFECT if divisors_sum == num else ABUNDANT if divisors_sum > num else DEFICIENT


if __name__ == "__main__":
    while True:
        try:
            print u'Please, enter a number (0 to exit): '
            num = abs(int(stdin.readline()))

            if num == 0:
                break

            number_type = get_number_type(num)

            print u'The number {} is {}.'.format(num, NUMBER_TYPES[number_type])
        except ValueError:
            print u'Invalid number'

