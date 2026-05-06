/// <reference types="react" />

type MathMLProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  xmlns?: string;
  linethickness?: string;
};

declare namespace JSX {
  interface IntrinsicElements {
    math: MathMLProps;

    // token elements
    mi: MathMLProps;
    mn: MathMLProps;
    mo: MathMLProps;
    ms: MathMLProps;
    mtext: MathMLProps;

    // layout
    mrow: MathMLProps;
    mfrac: MathMLProps;
    msqrt: MathMLProps;
    mroot: MathMLProps;
    mstyle: MathMLProps;
    merror: MathMLProps;
    mpadded: MathMLProps;
    mphantom: MathMLProps;
    mfenced: MathMLProps;
    menclose: MathMLProps;

    // scripts
    msub: MathMLProps;
    msup: MathMLProps;
    msubsup: MathMLProps;
    munder: MathMLProps;
    mover: MathMLProps;
    munderover: MathMLProps;
    mmultiscripts: MathMLProps;
    mprescripts: MathMLProps;

    // tables
    mtable: MathMLProps;
    mtr: MathMLProps;
    mlabeledtr: MathMLProps;
    mtd: MathMLProps;
    maligngroup: MathMLProps;
    malignmark: MathMLProps;

    // misc
    mspace: MathMLProps;
    maction: MathMLProps;

    // semantic / annotation
    semantics: MathMLProps;
    annotation: MathMLProps;
    "annotation-xml": MathMLProps;
  }
}
