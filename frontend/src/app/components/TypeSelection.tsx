import { motion } from 'motion/react';
import { Store, Truck } from 'lucide-react';

interface TypeSelectionProps {
  onSelectType: (
    type: 'mercado' | 'fornecedor'
  ) => void;
}

export default function TypeSelection({
  onSelectType
}: TypeSelectionProps) {

  return (

    <div className="min-h-screen flex items-center justify-center bg-background p-6">

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="w-full max-w-4xl"
      >

        {/* TÍTULO */}

        <div className="text-center mb-12">

          <h1 className="text-4xl font-bold text-foreground mb-3">
            Bem-vindo!
          </h1>

          <p className="text-xl text-muted-foreground">
            Selecione o tipo da sua conta
          </p>

        </div>

        {/* CARDS */}

        <div className="grid md:grid-cols-2 gap-6">

          {/* MERCADO */}

          <motion.button
            whileHover={{
              scale: 1.03,
              y: -8
            }}
            whileTap={{
              scale: 0.98
            }}
            onClick={() =>
              onSelectType('mercado')
            }
            className="
              bg-card
              border
              border-border
              rounded-3xl
              p-10
              shadow-lg
              hover:shadow-2xl
              transition
              text-center
              group
            "
          >

            <div className="
              inline-flex
              items-center
              justify-center
              w-24
              h-24
              bg-primary
              rounded-3xl
              mb-6
              group-hover:scale-110
              transition
            ">

              <Store className="w-12 h-12 text-primary-foreground" />

            </div>

            <h2 className="text-3xl font-bold text-foreground mb-3">
              Mercado
            </h2>

            <p className="text-muted-foreground text-lg">
              Participe de pedidos coletivos e economize nas compras
            </p>

          </motion.button>

          {/* FORNECEDOR */}

          <motion.button
            whileHover={{
              scale: 1.03,
              y: -8
            }}
            whileTap={{
              scale: 0.98
            }}
            onClick={() =>
              onSelectType('fornecedor')
            }
            className="
              bg-card
              border
              border-border
              rounded-3xl
              p-10
              shadow-lg
              hover:shadow-2xl
              transition
              text-center
              group
            "
          >

            <div className="
              inline-flex
              items-center
              justify-center
              w-24
              h-24
              bg-primary
              rounded-3xl
              mb-6
              group-hover:scale-110
              transition
            ">

              <Truck className="w-12 h-12 text-primary-foreground" />

            </div>

            <h2 className="text-3xl font-bold text-foreground mb-3">
              Fornecedor
            </h2>

            <p className="text-muted-foreground text-lg">
              Receba pedidos consolidados de múltiplos mercados
            </p>

          </motion.button>

        </div>

      </motion.div>

    </div>
  );
}