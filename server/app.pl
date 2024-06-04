require './RPC_APP.pm';

my $app = RPC_APP->new();

$app->add_sub('ref_key', sub {

    my $data = shift;

    my %item1 = (ref => 'ref1', key => 'name', value => 'primero');
    my %item2 = (ref => 'ref2', key => 'name', value => 'segundo');
    my %item3 = (ref => 'ref3', key => 'name', value => 'tercero');

    my @items = (\%item1, \%item2, \%item3);
    return \@items 
    
});

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






