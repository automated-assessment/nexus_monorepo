class Complex {
    friend bool operator ==(const Complex& a, const Complex& b);
    double real, imaginary;
public:
    Complex(double r, double i=0): real(r), imaginary(i){

    }

    double getReal(){
        return real;
    }

    double getImaginary(){
        return imaginary;
    }
};

bool operator ==( const Complex &a, const Complex &b )
{ 
  return a.real == b.real  &&  a.imaginary == b.imaginary; 
}