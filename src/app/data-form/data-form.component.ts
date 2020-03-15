import { DropdownService } from './../shared/services/dropdown.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { map, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { EstadosBr } from '../shared/models/estados-br';
import { ConsultaCepService } from '../shared/services/consulta-cep.service';
import { Observable, empty } from 'rxjs';
import { FormValidations } from '../shared/form-validations';
import { VerificaEmailService } from './services/verifica-email.service';
import { Cidade } from '../shared/models/cidade';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.css']
})
export class DataFormComponent implements OnInit {

  formulario: FormGroup;
  estados: EstadosBr[];
  cidades: Cidade[];
  //estados: Observable<EstadosBr[]> se ativar colocar async no html
  cargos: any[];
  tecnologias: any[];
  newsletterOp: any[];

  frameworks = ['Angular', 'React', 'Vue', 'Sencha'];



  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private dropdownService: DropdownService,
    private cepService: ConsultaCepService,
    private verificaEmailService: VerificaEmailService,

  ) { }

  ngOnInit() {
    //this.verificaEmailService.verificarEmail('').subscribe();

    //this.estados = this.dropdownService.getEstadoBr(); (ativar se observable tiver ativo !)
    this.cargos = this.dropdownService.getCargos();
    this.tecnologias = this.dropdownService.getTecnologias();
    this.newsletterOp = this.dropdownService.getNewsletter();

    this.dropdownService.getEstadoBr()
      .subscribe(dados => this.estados = dados);

    /*this.formulario = new FormGroup({
      nome: new FormControl(null),
      email: new FormControl(null)
    });*/

    this.formulario = this.formBuilder.group({
      nome: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      email: [null, [Validators.required, Validators.email], [this.validarEmail.bind(this)]],
      confirmarEmail: [null, [FormValidations.equalsTo('email')]],
      cep: [null, [Validators.required]], //FormValidations.cepValidator
      numero: ['', Validators.required],
      complemento: [''],
      rua: ['', Validators.required],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],

      cargo: [''],
      tecnologias: [''],
      newsletter: ['s'],
      termos: [null, Validators.pattern('true')],
      frameworks: this.buildFrameworks(),
    });

    /*this.formulario.get('cep').statusChanges
      .pipe(
        distinctUntilChanged(),
        tap(value => console.log('status CEP:', value)),
        switchMap(status => status === 'VALID' ?
          this.cepService.consultaCEP(this.formulario.get('cep').value)
          : empty()
        )
      )
      .subscribe(dados => dados ? this.populaDadosForm(dados) : {}
    );*/

    this.formulario.get('estado').valueChanges
      .pipe(
        tap(estado => console.log('Novo estado: ', estado)),
        map(estado => this.estados.filter(e => e.sigla === estado)),
        map(estados => estados && estados.length > 0 ? estados[0].id : empty()),
        switchMap((estadoId: any) => this.dropdownService.getCidades(estadoId)),
        tap(console.log)
      )
      .subscribe(cidades => this.cidades = cidades);


  }

  get controleDeFormulario() {
    return this.formulario.controls;
  }

  buildFrameworks() {
    const values = this.frameworks.map(v => new FormControl(false));
    return this.formBuilder.array(values, FormValidations.requiredMinCheckbox(1));
    /* this.formBuilder.array( [
      new FormControl(false), // angular
      new FormControl(false), // react
      new FormControl(false), // vue
      new FormControl(false) // sencha
    ]); */
  }

  onSubmit() {

    let valueSubmit = Object.assign({}, this.formulario.value);

    valueSubmit = Object.assign(valueSubmit, {
      frameworks: valueSubmit.frameworks
        .map((v, i) => v ? this.frameworks[i] : null)
        .filter(v => v !== null)
    });

    console.log(valueSubmit);

    if (this.formulario.valid) {
      this.http.post('https://httpbin.org/post', JSON.stringify({}))
        .pipe(map(res => res))
        .subscribe(dados => {
          console.log(dados);
          //this.resetar();
        },

        );
    } else {
      console.log('formulario invalido');
      Object.keys(this.formulario.controls).forEach(campo => {
        console.log(campo);
        const controle = this.formulario.get(campo);
        controle.markAsTouched();
      });
    }
  }

  /*verificaValidacoesForm(formGroup: FormGroup) {
    Object.keys(this.formulario.controls).forEach(campo =>{
      console.log(campo);
      const controle = this.formulario.get(campo);
      controle.markAsDirty();
      if (controle instanceof FormGroup) {
        this.verificaValidacoesForm(controle);
      }
    });
  }*/

  /*consultaCEP() {

    let cep = this.formulario.get('cep').value;
    //Nova variável "cep" somente com dígitos.
    cep = cep.replace(/\D/g, '');

    //Verifica se campo cep possui valor informado.
    if (cep != ""){

      this.resetaDadosForm();

      //Expressão regular para validar o CEP.
      var validacep = /^[0-9]{8}$/;

      //Valida o formato do CEP.
      if(validacep.test(cep)){
        this.http.get(`//viacep.com.br/ws/${cep}/json`)
        .pipe(map(dados => dados))
        .subscribe(dados => this.populaDadosForm(dados));
      }
      
    }
  }*/

  consultaCEP() {

    let cep = this.formulario.get('cep').value;

    if (cep != null && cep !== '') {
      this.cepService.consultaCEP(cep)
        .subscribe(dados => this.populaDadosForm(dados));
    }
  }

  populaDadosForm(dados) {
    this.formulario.patchValue({
      rua: dados.logradouro,
      cep: dados.cep,
      complemento: dados.complemento,
      bairro: dados.bairro,
      cidade: dados.localidade,
      estado: dados.uf
    });

    // console.log(form);
  }

  resetaDadosForm() {
    this.formulario.patchValue({
      rua: null,
      complemento: null,
      bairro: null,
      cidade: null,
      estado: null
    });
  }

  setarCargo() {
    const cargo = { nome: 'Dev', nivel: 'Pleno', desc: 'Dev Pl' };
    this.formulario.get('cargo').setValue(cargo);
  }

  compararCargos(obj1, obj2) {
    return obj1 && obj2 ? (obj1.nome === obj2.nome && obj1.nivel === obj2.nivel) : obj1 === obj2;
  }

  setarTecnologias() {
    this.formulario.get('tecnologias').setValue(['java', 'javascript', 'php']);
  }

  validarEmail(formControl: FormControl) {
    return this.verificaEmailService.verificarEmail(formControl.value)
      .pipe(map(emailExiste => emailExiste ? { emailInvalido: true } : null));
  }

}
