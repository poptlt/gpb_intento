require './RPC_APP.pm';

my $app = RPC_APP->new();

$app->add_sub('ping', sub {'pong'});

$app->add_sub('test1', sub{

    my $ctx = shift;
    return $ctx;
});

$app->add_sub('test2', sub{

    my $ctx = shift;
    die 'USER:::No tienes razon!:::';
    return $ctx;
});

my @list = qw{ ref1 ref2 ref3 };

$app->add_sub('get_list', sub {\@list});

$app->add_folder('math', './math.pl');

return $app






