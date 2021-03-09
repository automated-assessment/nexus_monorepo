#include <iostream>
#include <string>

#include "complex.h"

int main(){

    Complex c(5, 1);

    std::cout << c.getReal();
    std::cout << " ";
    std::cout << c.getImaginary();

    return 0;
}