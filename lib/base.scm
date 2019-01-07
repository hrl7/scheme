(define atom? (lambda (x) (and (not (null? x)) (not (pair? x)))))

(define lat? 
  (lambda (lst)
    (cond
      ((null? lst) #t)
      ((atom? (car lst)) (lat? (cdr lst)))
      (else #f))))
